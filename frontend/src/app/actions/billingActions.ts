'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) throw new Error('Unauthorized');
  return (session.user as any).id as string;
}

/**
 * Fetches the user's current subscription details from the database.
 */
export async function getUserSubscription(companyId?: string) {
  const userId = await requireSession();

  // Batch 1: fetch user + lava payments + companies in parallel
  const [user, lavaPaymentCount, userCompanies] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription_tier: true,
        subscription_status: true,
        current_period_end: true,
        stripe_customer_id: true,
      },
    }),
    prisma.payment.count({
      where: { user_id: userId, provider: 'lava', status: 'succeeded' },
    }),
    prisma.company.findMany({
      where: {
        OR: [
          { user_id: userId },
          { members: { some: { user_id: userId } } },
        ],
      },
      select: { id: true },
    }),
  ]);

  if (!user) throw new Error('User not found');

  const companyIds = userCompanies.map((c) => c.id);
  const targetCompanyId = companyId && companyIds.includes(companyId)
    ? companyId
    : (companyIds[0] || null);

  // Batch 2: fetch usage counts in parallel (only if we have a company)
  let claimCount = 0;
  let memberCount = 0;
  if (targetCompanyId) {
    const [claims, members] = await Promise.all([
      prisma.claim.count({ where: { company_id: targetCompanyId } }),
      prisma.companyMember.count({ where: { company_id: targetCompanyId } }),
    ]);
    claimCount = claims;
    memberCount = members;
  }

  return {
    tier: user.subscription_tier,
    status: user.subscription_status,
    periodEnd: user.current_period_end,
    hasLavaSubscription: lavaPaymentCount > 0 || (!user.stripe_customer_id && user.subscription_tier !== 'FREE' && user.subscription_tier !== 'UNLIMITED'),
    usage: {
      calculations: claimCount,
      members: memberCount,
    },
  };
}

/**
 * Generates a Stripe Customer Portal session URL.
 * Allows users to manage their cards, invoices, and cancel their subscription.
 */
export async function createStripePortalSession() {
  const userId = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripe_customer_id: true },
  });

  if (!user?.stripe_customer_id) {
    throw new Error('No Stripe customer associated with this user');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${appUrl}/settings/billing`,
  });

  return { url: session.url };
}
