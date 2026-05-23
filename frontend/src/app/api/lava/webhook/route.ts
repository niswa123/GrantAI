import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../../lib/prisma';
import { loopsOnSubscriptionActivated } from '../../../../lib/loops';
import { attioOnSubscriptionActivated } from '../../../../lib/attio';

// Inline PostHog event capture — no external SDK needed
async function captureAnalyticsEvent(distinctId: string, event: string, properties?: Record<string, any>) {
  try {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com';
    await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: key, distinct_id: distinctId, event, properties }),
    });
  } catch {
    // Analytics is non-critical — never throw on failure
  }
}


/**
 * POST /api/lava/webhook
 *
 * Receives and processes Lava.top lifecycle events.
 * Raw body is required for signature verification — do NOT parse JSON first.
 *
 * Handled events:
 *   - invoice.paid / payment.success  → grant subscription access
 */
export async function POST(request: Request) {
  // ── Read raw body for signature verification ───────────────────────────────
  const bodyText = await request.text();
  const webhookSecret = process.env.LAVA_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Lava Webhook] LAVA_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Look for the signature across common header formats
  const receivedSig = 
    request.headers.get('x-lava-signature') ||
    request.headers.get('signature') ||
    request.headers.get('x-sign') ||
    request.headers.get('x-signature');

  if (!receivedSig) {
    console.error('[Lava Webhook] Missing signature header');
    return NextResponse.json(
      { error: 'Missing signature header' },
      { status: 401 }
    );
  }

  // ── Verify HMAC-SHA256 signature ───────────────────────────────────────────
  const computedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(bodyText)
    .digest('hex');

  const signaturesMatch = crypto.timingSafeEqual(
    Buffer.from(computedSig, 'hex'),
    Buffer.from(receivedSig, 'hex')
  );

  if (!signaturesMatch) {
    console.warn(`[Lava Webhook] Signature verification failed. Calculated: ${computedSig}, Received: ${receivedSig}`);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 401 }
    );
  }

  // ── Parse body JSON after successful verification ──────────────────────────
  let payload: any;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  console.log('[Lava Webhook] Received validated event payload:', JSON.stringify(payload, null, 2));

  // Determine event type and billing data from payload
  const eventType = payload.eventType || payload.event;
  const status = payload.status;
  const invoiceId = payload.contractId || payload.id;
  const amount = parseFloat(payload.amount || '0');
  const currency = (payload.currency || 'USD').toLowerCase();

  // We are interested in paid/completed payments
  const isPaidEvent = 
    eventType === 'payment.success' || 
    eventType === 'invoice.paid' || 
    status === 'completed' || 
    status === 'paid' ||
    status === 'subscription-active';

  if (!isPaidEvent) {
    console.log(`[Lava Webhook] Ignoring unhandled or unpaid event: ${eventType || status}`);
    return NextResponse.json({ received: true });
  }

  // ── Locate user by buyer.email ─────────────────────────────────────────────
  const email = payload.buyer?.email;
  if (!email) {
    console.error('[Lava Webhook] Missing buyer email in payload:', invoiceId);
    return NextResponse.json({ error: 'Missing buyer email' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`[Lava Webhook] User with email ${email} not found for transaction:`, invoiceId);
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const userId = user.id;

  // ── Match plan by product ID or offer ID ───────────────────────────────────
  const productId = payload.product?.id;
  const offerId = payload.offer?.id;
  
  console.log(`[Lava Webhook] Matching plan. Received productId: ${productId}, offerId: ${offerId}`);
  
  let plan: 'PRO' | 'ENTERPRISE' | null = null;
  
  const isPro = 
    productId === '6d36ce89-74db-4773-986f-06d7fc2534c5' || // PRO Product ID
    offerId === '2459b809-38cb-4aa5-9939-8963b6620f0f' ||   // PRO Offer ID
    productId === process.env.LAVA_PRO_OFFER_ID ||
    offerId === process.env.LAVA_PRO_OFFER_ID;

  const isEnterprise = 
    productId === '54b1454e-5c86-4fec-b14b-5b1ab11bf3f8' || // Enterprise Product ID
    offerId === '76d7657a-8667-44f9-8772-6f4b549b48ba' ||   // Enterprise Offer ID
    productId === process.env.LAVA_ENTERPRISE_OFFER_ID ||
    offerId === process.env.LAVA_ENTERPRISE_OFFER_ID;

  if (isPro) {
    plan = 'PRO';
  } else if (isEnterprise) {
    plan = 'ENTERPRISE';
  }

  if (!plan) {
    console.error(`[Lava Webhook] Unrecognized product ID: ${productId} or offer ID: ${offerId} for transaction:`, invoiceId);
    return NextResponse.json({ error: 'Unrecognized product/offer ID' }, { status: 400 });
  }

  try {
    // ── Update DB user subscription state ────────────────────────────────────
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Grant 30 days of access

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription_tier: plan,
        subscription_status: 'ACTIVE',
        current_period_end: periodEnd,
      },
    });

    // ── Upsert Payment record for revenue tracking ───────────────────────────
    await prisma.payment.upsert({
      where: { external_payment_id: invoiceId },
      create: {
        user_id: userId,
        provider: 'lava',
        external_payment_id: invoiceId,
        amount: amount,
        currency: currency,
        status: 'succeeded',
      },
      update: { status: 'succeeded' },
    });

    console.log(`[Lava Webhook] Successfully granted ${plan} plan access to user ${userId} via Lava.top`);

    // 📣 CRM and email marketing notifications
    const userEmail = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (userEmail?.email) {
      loopsOnSubscriptionActivated({ email: userEmail.email, plan: plan as 'PRO' | 'ENTERPRISE' });
      attioOnSubscriptionActivated({ email: userEmail.email, plan: plan as 'PRO' | 'ENTERPRISE' });
    }

    // 📊 Server-side analytics event for user funnel conversions
    await captureAnalyticsEvent(userId, 'Payment Success', {
      plan,
      amount: amount,
      currency: currency,
      provider: 'lava',
      $set: { subscription_tier: plan, is_paying: true },
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Lava Webhook] Database update failed:', err);
    return NextResponse.json(
      { error: 'Failed to process payment updates' },
      { status: 500 }
    );
  }
}
