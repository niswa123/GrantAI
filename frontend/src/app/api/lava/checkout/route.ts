import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

const LAVA_API_URL = 'https://gate.lava.top/api/v3/invoice';

const PLAN_CONFIG: Record<'PRO' | 'ENTERPRISE', { offerId: string | undefined }> = {
  PRO: {
    offerId: process.env.LAVA_PRO_OFFER_ID,
  },
  ENTERPRISE: {
    offerId: process.env.LAVA_ENTERPRISE_OFFER_ID,
  },
};

/**
 * POST /api/lava/checkout
 *
 * Creates a Lava.top Invoice/Checkout session for the authenticated user.
 *
 * Request body:
 *   { plan: "PRO" | "ENTERPRISE" }
 *
 * Response:
 *   { url: string } — Lava.top checkout page URL to redirect the user to.
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

  const { offerId } = PLAN_CONFIG[plan];
  if (!offerId) {
    console.error(`[Lava Checkout] LAVA_${plan}_OFFER_ID is not configured in env variables`);
    return NextResponse.json(
      { error: `Payment system is currently misconfigured for ${plan} plan` },
      { status: 500 }
    );
  }

  if (!process.env.LAVA_API_KEY) {
    console.error('[Lava Checkout] LAVA_API_KEY is not set');
    return NextResponse.json(
      { error: 'Payment system API key is not configured' },
      { status: 500 }
    );
  }

  try {
    // ── Get user email ───────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ── Sanitize email ───────────────────────────────────────────────────────
    // Lava.top v3 API rejects emails with whitespace or invalid format
    const rawEmail = user.email;
    if (!rawEmail) {
      return NextResponse.json({ error: 'User account has no email address' }, { status: 400 });
    }
    const sanitizedEmail = rawEmail.trim().toLowerCase();
    // Basic RFC-5322 check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      console.error(`[Lava Checkout] Invalid email format: "${sanitizedEmail}"`);
      return NextResponse.json(
        { error: `Invalid email address on your account: ${sanitizedEmail}` },
        { status: 400 }
      );
    }

    // ── Query Lava.top to create Invoice ─────────────────────────────────────
    const payload = {
      offerId,
      email: sanitizedEmail,
      currency: 'RUB', // standard default currency for Lava.top
    };

    console.log('[Lava Checkout] Sending invoice request to Lava.top:', { ...payload, email: sanitizedEmail });

    const response = await fetch(LAVA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.LAVA_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log(`[Lava Checkout] Response status: ${response.status}. Body:`, responseText);

    if (!response.ok) {
      // Parse Lava error for a user-friendly message
      let userMessage = `Lava.top error (${response.status})`;
      try {
        const errData = JSON.parse(responseText);
        const lavaError = errData?.error || '';
        if (lavaError.toLowerCase().includes('incorrect email')) {
          // Lava blocks purchases when buyer email matches merchant account email
          userMessage = 'This account email matches the Lava.top merchant email. You cannot purchase your own product. Please use a different account or contact support.';
        } else if (lavaError) {
          userMessage = lavaError;
        }
      } catch {
        userMessage = responseText || userMessage;
      }
      console.error(`[Lava Checkout] API error ${response.status}: ${responseText}`);
      return NextResponse.json(
        { error: userMessage },
        { status: response.status === 401 ? 401 : 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse JSON response from Lava.top' },
        { status: 500 }
      );
    }

    // Accept redirect URL from data.paymentUrl or fallback to data.url/data.data.url
    const redirectUrl = data?.paymentUrl || data?.url || data?.data?.url;

    if (!redirectUrl) {
      return NextResponse.json(
        { error: `Lava.top response did not return redirect URL. Response: ${responseText}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: redirectUrl });
  } catch (err: any) {
    console.error('[Lava Checkout] Error creating checkout:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
