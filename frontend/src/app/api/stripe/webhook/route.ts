import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { loopsOnSubscriptionActivated, loopsOnSubscriptionCancelled } from '@/lib/loops';
import { attioOnSubscriptionActivated, attioOnSubscriptionCancelled } from '@/lib/attio';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

/**
 * POST /api/stripe/webhook
 *
 * Receives and processes Stripe lifecycle events.
 * Raw body is required for signature verification — do NOT parse JSON first.
 *
 * Handled events:
 *   - checkout.session.completed     → grant initial subscription access
 *   - invoice.payment_succeeded      → renew current_period_end
 *   - customer.subscription.deleted  → revoke access (FREE tier)
 *
 * Configure in Stripe Dashboard → Developers → Webhooks:
 *   URL: https://your-domain.com/api/stripe/webhook
 *   Events: checkout.session.completed, invoice.payment_succeeded,
 *           customer.subscription.deleted
 */
export async function POST(request: Request) {
  // ── Read raw body for signature verification ───────────────────────────────
  const bodyText = await request.text();
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 401 }
    );
  }

  // ── Verify signature ───────────────────────────────────────────────────────
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(bodyText, sig, webhookSecret);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 401 }
    );
  }

  // ── Route event types ──────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        // Acknowledge but do not process unhandled events
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Handler error for ${event.type}:`, err);
    // Return 500 so Stripe retries the event
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// ── Event Handlers ─────────────────────────────────────────────────────────────

/**
 * checkout.session.completed
 *
 * Fires when the user completes the Stripe Checkout flow.
 * Grants initial subscription access.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as 'PRO' | 'ENTERPRISE' | undefined;

  if (!userId || !plan) {
    console.error('[Stripe Webhook] checkout.session.completed missing metadata', session.id);
    return;
  }

  // Retrieve full subscription to get period_end
  let periodEnd: Date | null = null;
  let stripeSubscriptionId: string | null = null;

  if (session.mode === 'subscription' && session.subscription) {
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    stripeSubscriptionId = subscription.id;
    periodEnd = new Date(subscription.current_period_end * 1000);
  } else if (session.mode === 'payment') {
    // One-time payment → grant 30 days of access
    periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscription_tier: plan === 'PRO' ? 'PRO' : 'ENTERPRISE',
      subscription_status: 'ACTIVE',
      ...(stripeSubscriptionId && { stripe_subscription_id: stripeSubscriptionId }),
      ...(periodEnd && { current_period_end: periodEnd }),
    },
  });

  // Record payment
  if (session.payment_intent) {
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent.id;

    await prisma.payment.upsert({
      where: { external_payment_id: paymentIntentId },
      create: {
        user_id: userId,
        provider: 'stripe',
        external_payment_id: paymentIntentId,
        amount: (session.amount_total ?? 0) / 100,
        currency: session.currency ?? 'usd',
        status: 'succeeded',
      },
      update: { status: 'succeeded' },
    });
  }

  console.log(`[Stripe Webhook] Granted ${plan} to user ${userId}`);

  // 📣 Update Loops contact — stops "upgrade" drip, starts "power user" sequence
  const userEmail = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (userEmail?.email) {
    loopsOnSubscriptionActivated({ email: userEmail.email, plan });
    attioOnSubscriptionActivated({ email: userEmail.email, plan });
  }
}

/**
 * invoice.payment_succeeded
 *
 * Fires on each successful subscription renewal. Updates current_period_end.
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.warn('[Stripe Webhook] invoice.payment_succeeded — no userId in subscription metadata');
    return;
  }

  const periodEnd = new Date(subscription.current_period_end * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscription_status: 'ACTIVE',
      current_period_end: periodEnd,
    },
  });

  console.log(`[Stripe Webhook] Renewed subscription for user ${userId}, period ends ${periodEnd.toISOString()}`);
}

/**
 * customer.subscription.deleted
 *
 * Fires when a subscription is cancelled (immediately or at period end).
 * Reverts the user to FREE tier.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.warn('[Stripe Webhook] customer.subscription.deleted — no userId in subscription metadata');
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscription_tier: 'FREE',
      subscription_status: 'CANCELED',
      stripe_subscription_id: null,
      current_period_end: null,
    },
  });

  console.log(`[Stripe Webhook] Revoked subscription for user ${userId}`);

  // 📣 Update Loops contact — starts "win-back" drip sequence
  const userEmail = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (userEmail?.email) {
    loopsOnSubscriptionCancelled(userEmail.email);
    attioOnSubscriptionCancelled(userEmail.email);
  }
}
