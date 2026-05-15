import { createHmac } from 'crypto';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * NOWPayments IPN payload shape (partial — only fields we use).
 * Full docs: https://documenter.getpostman.com/view/7907941/2s93JusNJt
 */
interface NowPaymentsIPN {
  payment_id: string | number;
  payment_status: string;
  order_id: string;     // "{userId}:{plan}" set when creating the invoice
  price_amount: number;
  price_currency: string;
  actually_paid: number;
  pay_currency: string;
}

/**
 * POST /api/nowpayments/webhook
 *
 * Receives IPN (Instant Payment Notification) events from NOWPayments.
 * Verifies the HMAC-SHA512 signature, then grants subscription access
 * when payment status is "finished".
 *
 * Signature header: x-nowpayments-sig
 * Algorithm: HMAC-SHA512 of the alphabetically sorted JSON body,
 *            using NOWPAYMENTS_IPN_SECRET as the key.
 *
 * Configure the IPN callback URL in the NOWPayments dashboard to:
 *   https://your-domain.com/api/nowpayments/webhook
 */
export async function POST(request: Request) {
  // ── Read raw body for signature verification ───────────────────────────────
  const bodyText = await request.text();
  const signature = request.headers.get('x-nowpayments-sig');
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

  if (!ipnSecret) {
    console.error('[NOWPayments Webhook] NOWPAYMENTS_IPN_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing x-nowpayments-sig header' },
      { status: 401 }
    );
  }

  // ── Verify HMAC-SHA512 signature ───────────────────────────────────────────
  // NOWPayments signs the body where keys are sorted alphabetically.
  let parsedBody: NowPaymentsIPN;
  try {
    parsedBody = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Recreate the alphabetically sorted JSON string as NOWPayments does
  const sortedBody = JSON.stringify(
    Object.fromEntries(
      Object.entries(parsedBody).sort(([a], [b]) => a.localeCompare(b))
    )
  );

  const expectedSig = createHmac('sha512', ipnSecret)
    .update(sortedBody)
    .digest('hex');

  if (expectedSig !== signature) {
    console.warn('[NOWPayments Webhook] Signature mismatch');
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 401 }
    );
  }

  // ── Only process "finished" payments ──────────────────────────────────────
  if (parsedBody.payment_status !== 'finished') {
    console.log(
      `[NOWPayments Webhook] Ignored status: ${parsedBody.payment_status} for order ${parsedBody.order_id}`
    );
    // Always return 200 so NOWPayments does not retry non-terminal statuses
    return NextResponse.json({ received: true, processed: false });
  }

  // ── Parse order_id to extract userId and plan ──────────────────────────────
  const [userId, plan] = (parsedBody.order_id ?? '').split(':');

  if (!userId || !plan || !['PRO', 'ENTERPRISE'].includes(plan)) {
    console.error(
      '[NOWPayments Webhook] Could not parse order_id:',
      parsedBody.order_id
    );
    // Return 200 to prevent NOWPayments retrying a malformed order_id
    return NextResponse.json({ received: true, processed: false });
  }

  const tier = plan as 'PRO' | 'ENTERPRISE';

  try {
    // ── Grant 30 days of access ─────────────────────────────────────────────
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription_tier: tier,
        subscription_status: 'ACTIVE',
        current_period_end: periodEnd,
      },
    });

    // ── Record the payment ──────────────────────────────────────────────────
    const externalId = String(parsedBody.payment_id);

    await prisma.payment.upsert({
      where: { external_payment_id: externalId },
      create: {
        user_id: userId,
        provider: 'nowpayments',
        external_payment_id: externalId,
        amount: parsedBody.price_amount,
        currency: parsedBody.price_currency ?? 'usd',
        status: 'succeeded',
      },
      update: { status: 'succeeded' },
    });

    console.log(
      `[NOWPayments Webhook] Granted ${tier} to user ${userId}, period ends ${periodEnd.toISOString()}`
    );
  } catch (err) {
    console.error('[NOWPayments Webhook] DB error:', err);
    // Return 500 so NOWPayments retries — we haven't granted access yet
    return NextResponse.json(
      { error: 'Database update failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true, processed: true });
}
