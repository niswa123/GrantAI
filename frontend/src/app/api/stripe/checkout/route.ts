import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

/**
 * Maps plan identifiers to Stripe Price IDs (set in .env).
 * Stripe mode is "subscription" for PRO (recurring) and "payment" for ENTERPRISE (one-time).
 */
const PLAN_CONFIG: Record<
  'PRO' | 'ENTERPRISE',
  { priceId: string; mode: 'subscription' | 'payment' }
> = {
  PRO: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    mode: 'subscription',
  },
  ENTERPRISE: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    mode: 'payment',
  },
};

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for the authenticated user.
 *
 * Request body:
 *   { plan: "PRO" | "ENTERPRISE" }
 *
 * Response:
 *   { url: string }  — Stripe-hosted checkout URL to redirect the user to.
 *
 * Error responses:
 *   401 — Not authenticated
 *   400 — Invalid plan
 *   500 — Stripe or DB error
 */
export async function POST(request: Request) {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let plan: 'PRO' | 'ENTERPRISE';
  try {
    const body = await request.json();
    plan = body.plan;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!plan || !(plan in PLAN_CONFIG)) {
    return NextResponse.json(
      { error: 'Invalid plan. Must be "PRO" or "ENTERPRISE".' },
      { status: 400 }
    );
  }

  const { priceId, mode } = PLAN_CONFIG[plan];

  try {
    // ── Resolve or create Stripe Customer ──────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripe_customer_id: true, display_name: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.display_name ?? undefined,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;

      // Persist the new customer ID immediately so future calls skip creation
      await prisma.user.update({
        where: { id: userId },
        data: { stripe_customer_id: stripeCustomerId },
      });
    }

    // ── Create Checkout Session ─────────────────────────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment/canceled`,
      // Embed userId + plan so the webhook can identify the user without a DB lookup
      metadata: { userId, plan },
      // For subscriptions, also pass to the subscription metadata
      ...(mode === 'subscription' && {
        subscription_data: { metadata: { userId, plan } },
      }),
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('[Stripe Checkout] Error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
