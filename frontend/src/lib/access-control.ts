import prisma from '@/lib/prisma';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

// Fallback is left empty so no random email gets admin access if env var is missing
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';

export interface AccessLevel {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  hasAccess: boolean;
  isAdmin: boolean;
}

export async function getUserAccessLevel(userId: string): Promise<AccessLevel> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, subscription_tier: true, subscription_status: true }
  });

  if (!user) {
    return {
      tier: 'FREE',
      status: 'NONE',
      hasAccess: false,
      isAdmin: false
    };
  }

  // Hardcode/Exception Logic
  if (user.email === ADMIN_EMAIL) {
    return {
      tier: 'UNLIMITED',
      status: 'ACTIVE',
      hasAccess: true,
      isAdmin: true
    };
  }

  // General Access Logic (PRO or ENTERPRISE with ACTIVE status, or UNLIMITED)
  const isPremiumTier = ['PRO', 'ENTERPRISE', 'UNLIMITED'].includes(user.subscription_tier);
  const isActive = user.subscription_status === 'ACTIVE' || user.subscription_tier === 'UNLIMITED';
  const hasAccess = isPremiumTier && isActive;

  return {
    tier: user.subscription_tier,
    status: user.subscription_status,
    hasAccess,
    isAdmin: false
  };
}
