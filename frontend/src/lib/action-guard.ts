'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export type ActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? object : { data: T }))
  | { success: false; error: string };

/**
 * requireAuth — core guard for all Server Actions.
 *
 * Checks:
 *  1. Valid session (user is logged in)
 *  2. Email is verified (prevents unverified users from calling backend)
 *
 * Throws an Error on failure — callers should wrap in try/catch or use `protectedAction`.
 */
export async function requireAuth(): Promise<{ userId: string; emailVerified: boolean }> {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || !user?.id) {
    throw new Error('Unauthorized');
  }

  if (!user.emailVerified) {
    throw new Error('Email not verified. Please verify your email before continuing.');
  }

  return {
    userId: user.id as string,
    emailVerified: true,
  };
}

/**
 * protectedAction — HOC wrapper for Server Actions.
 *
 * Usage:
 *   export const myAction = protectedAction(async (userId) => {
 *     // userId is guaranteed to exist and email is verified
 *     return { success: true };
 *   });
 */
export function protectedAction<TArgs extends unknown[], TReturn>(
  fn: (userId: string, ...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn | { error: string }> {
  return async (...args: TArgs) => {
    try {
      const { userId } = await requireAuth();
      return await fn(userId, ...args);
    } catch (err: any) {
      const msg = err?.message || 'Unauthorized';
      // Surface clean errors for Unauthorized/not-verified
      if (msg === 'Unauthorized' || msg.startsWith('Email not verified')) {
        return { error: msg };
      }
      // Re-throw unexpected errors so they still surface
      throw err;
    }
  };
}
