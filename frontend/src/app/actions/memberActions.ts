'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ── Types ─────────────────────────────────────────────────────────────────

export type MemberRole = 'Admin' | 'Editor' | 'Viewer';
export type MemberStatus = 'Active' | 'Pending';

export interface MemberRecord {
  id: string;          // CompanyMember.id
  userId: string;      // User.id (null for pending email invites)
  email: string;
  name: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;    // ISO date string
}

// ── Auth helper ───────────────────────────────────────────────────────────

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) throw new Error('Unauthorized');
  return (session.user as any).id as string;
}

// ── Read: Get all members of a company ───────────────────────────────────

export async function getCompanyMembers(companyId: string): Promise<MemberRecord[]> {
  const userId = await requireSession();

  // Only the company owner (or an Admin member) can list members
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { user_id: true },
  });

  if (!company) return [];

  const isOwner = company.user_id === userId;
  if (!isOwner) {
    const membership = await prisma.companyMember.findUnique({
      where: { user_id_company_id: { user_id: userId, company_id: companyId } },
      select: { role: true },
    });
    if (!membership || membership.role !== 'Admin') return [];
  }

  const members = await prisma.companyMember.findMany({
    where: { company_id: companyId },
    include: { user: { select: { id: true, email: true, display_name: true } } },
    orderBy: { created_at: 'asc' },
  });

  return members.map((m) => ({
    id: m.id,
    userId: m.user.id,
    email: m.user.email,
    name: m.user.display_name || m.user.email.split('@')[0],
    role: m.role as MemberRole,
    status: m.status as MemberStatus,
    joinedAt: m.created_at.toISOString(),
  }));
}

// ── Invite: look up or create user stub, then add membership ─────────────

export async function inviteMember(companyId: string, email: string, role: MemberRole) {
  const actorId = await requireSession();

  // Verify actor owns or is Admin of the company
  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { user_id: true } });
  if (!company) return { error: 'Company not found' };

  const isOwner = company.user_id === actorId;
  if (!isOwner) {
    const membership = await prisma.companyMember.findUnique({
      where: { user_id_company_id: { user_id: actorId, company_id: companyId } },
      select: { role: true },
    });
    if (!membership || membership.role !== 'Admin') return { error: 'Unauthorized' };
  }

  // Find or create invited user (stub — no password)
  let invitedUser = await prisma.user.findUnique({ where: { email } });
  if (!invitedUser) {
    invitedUser = await prisma.user.create({
      data: { email, password_hash: '', display_name: email.split('@')[0] },
    });
  }

  // Check if already a member
  const existing = await prisma.companyMember.findUnique({
    where: { user_id_company_id: { user_id: invitedUser.id, company_id: companyId } },
  });
  if (existing) return { error: 'User is already a member of this workspace' };

  const member = await prisma.companyMember.create({
    data: {
      user_id: invitedUser.id,
      company_id: companyId,
      role,
      status: 'Pending',
    },
    include: { user: true },
  });

  revalidatePath('/settings/members');

  return {
    success: true,
    member: {
      id: member.id,
      userId: member.user.id,
      email: member.user.email,
      name: member.user.display_name || member.user.email.split('@')[0],
      role: member.role as MemberRole,
      status: member.status as MemberStatus,
      joinedAt: member.created_at.toISOString(),
    } satisfies MemberRecord,
  };
}

// ── Update Role ───────────────────────────────────────────────────────────

export async function updateMemberRole(memberId: string, role: MemberRole) {
  const actorId = await requireSession();

  const member = await prisma.companyMember.findUnique({
    where: { id: memberId },
    include: { company: { select: { user_id: true } } },
  });
  if (!member) return { error: 'Member not found' };

  const isOwner = member.company.user_id === actorId;
  if (!isOwner) {
    const myRole = await prisma.companyMember.findUnique({
      where: { user_id_company_id: { user_id: actorId, company_id: member.company_id } },
      select: { role: true },
    });
    if (!myRole || myRole.role !== 'Admin') return { error: 'Unauthorized' };
  }

  await prisma.companyMember.update({ where: { id: memberId }, data: { role } });
  revalidatePath('/settings/members');
  return { success: true };
}

// ── Remove Member ─────────────────────────────────────────────────────────

export async function removeMember(memberId: string) {
  const actorId = await requireSession();

  const member = await prisma.companyMember.findUnique({
    where: { id: memberId },
    include: { company: { select: { user_id: true } } },
  });
  if (!member) return { error: 'Member not found' };

  const isOwner = member.company.user_id === actorId;
  if (!isOwner) {
    const myRole = await prisma.companyMember.findUnique({
      where: { user_id_company_id: { user_id: actorId, company_id: member.company_id } },
      select: { role: true },
    });
    if (!myRole || myRole.role !== 'Admin') return { error: 'Unauthorized' };
  }

  // Prevent removing yourself
  if (member.user_id === actorId) return { error: 'Cannot remove yourself from the workspace' };

  await prisma.companyMember.delete({ where: { id: memberId } });
  revalidatePath('/settings/members');
  return { success: true };
}
