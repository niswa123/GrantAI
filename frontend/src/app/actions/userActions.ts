'use server';

import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ── Auth helper ───────────────────────────────────────────────────────────

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) throw new Error('Unauthorized');
  return (session.user as any).id as string;
}

// ── Get current user profile ──────────────────────────────────────────────

export async function getUserProfile() {
  const userId = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, display_name: true, avatar_url: true },
  });
  if (!user) return null;
  return { email: user.email, displayName: user.display_name || '', avatarUrl: user.avatar_url || '' };
}

// ── Update display name, email, and/or avatar ──────────────────────────────

export async function updateUserProfile(displayName: string, email: string, avatarUrl?: string) {
  const userId = await requireSession();

  if (!email || !email.includes('@')) return { error: 'Invalid email address' };
  if (!displayName.trim()) return { error: 'Display name cannot be empty' };

  // Check email uniqueness if changed
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    return { error: 'Email is already in use by another account' };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { 
      email, 
      display_name: displayName.trim(),
      ...(avatarUrl !== undefined && { avatar_url: avatarUrl })
    },
  });

  revalidatePath('/settings/account');
  return { success: true };
}

// ── Change password with bcrypt verification ──────────────────────────────

export async function changePassword(oldPassword: string, newPassword: string) {
  const userId = await requireSession();

  if (newPassword.length < 8) return { error: 'New password must be at least 8 characters' };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password_hash: true },
  });
  if (!user) return { error: 'User not found' };

  // Verify old password
  const valid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!valid) return { error: 'Incorrect current password' };

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password_hash: newHash } });

  return { success: true };
}
