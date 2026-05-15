import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * USD amounts for each plan tier.
 * Update these if pricing changes.
 */
const PLAN_AMOUNTS: Record<'PRO' | 'ENTERPRISE', number> = {
  PRO: 29,
  ENTERPRISE: 99,
};

/**
 * POST /api/nowpayments/invoice
 *
 * Creates a NOWPayments hosted invoice for the authenticated user.
 *
 * Request body:
 *   { plan: "PRO" | "ENTERPRISE" }
 *
 * Response:
 *   { url: string }  — NOWPayments-hosted payment URL to redirect the user to.
 *
 * The order_id is formatted as "{userId}:{plan}" so the IPN webhook can
 * unambiguously identify the user and the purchased plan.
 *
 * Error responses:
 *   401 — Not authenticated
 *   400 — Invalid plan
 *   502 — NOWPayments API error
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

  if (!plan || !(plan in PLAN_AMOUNTS)) {
    return NextResponse.json(
      { error: 'Invalid plan. Must be "PRO" or "ENTERPRISE".' },
      { status: 400 }
    );
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    console.error('[NOWPayments Invoice] NOWPAYMENTS_API_KEY is not set');
    return NextResponse.json(
      { error: 'Payment provider not configured' },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  // ── Call NOWPayments Invoice API ───────────────────────────────────────────
  try {
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        price_amount: PLAN_AMOUNTS[plan],
        price_currency: 'usd',
        // order_id is used by the IPN webhook to identify the user + plan
        order_id: `${userId}:${plan}`,
        order_description: `GrantAI ${plan} Plan – 30 days`,
        ipn_callback_url: `${appUrl}/api/nowpayments/webhook`,
        success_url: `${appUrl}/payment/success`,
        cancel_url: `${appUrl}/payment/canceled`,
        // is_fixed_rate: true ensures the user pays the exact USD equivalent
        is_fixed_rate: true,
        is_fee_paid_by_user: false,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[NOWPayments Invoice] API error:', response.status, errorBody);
      return NextResponse.json(
        { error: 'Failed to create payment invoice', details: errorBody },
        { status: 502 }
      );
    }

    const invoice = await response.json();

    if (!invoice.invoice_url) {
      console.error('[NOWPayments Invoice] No invoice_url in response:', invoice);
      return NextResponse.json(
        { error: 'Invoice URL missing from provider response' },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: invoice.invoice_url });
  } catch (err) {
    console.error('[NOWPayments Invoice] Network error:', err);
    return NextResponse.json(
      { error: 'Failed to reach payment provider' },
      { status: 502 }
    );
  }
}
