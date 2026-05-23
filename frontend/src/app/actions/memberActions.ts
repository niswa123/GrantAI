'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

// ── Types ─────────────────────────────────────────────────────────────────

export type MemberRole = 'Admin' | 'Editor' | 'Viewer';
export type MemberStatus = 'Active' | 'Pending';

export interface MemberRecord {
  id: string;          // CompanyMember.id or WorkspaceInvite.id
  userId: string | null; // User.id (null for pending email invites)
  email: string;
  name: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;    // ISO date string
  isInvite?: boolean;
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

  // Batch 1: fetch company ownership + caller's membership in parallel
  const [company, membership] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: { user_id: true },
    }),
    prisma.companyMember.findUnique({
      where: { user_id_company_id: { user_id: userId, company_id: companyId } },
      select: { role: true },
    }),
  ]);

  if (!company) return [];

  const isOwner = company.user_id === userId;
  if (!isOwner && (!membership || membership.role !== 'Admin')) return [];

  // Batch 2: fetch members + pending invites in parallel
  const [members, invites] = await Promise.all([
    prisma.companyMember.findMany({
      where: { company_id: companyId },
      include: { user: { select: { id: true, email: true, display_name: true } } },
    }),
    prisma.workspaceInvite.findMany({
      where: { company_id: companyId },
    }),
  ]);

  const activeRecords: MemberRecord[] = members.map((m) => ({
    id: m.id,
    userId: m.user.id,
    email: m.user.email,
    name: m.user.display_name || m.user.email.split('@')[0],
    role: m.role as MemberRole,
    status: m.status as MemberStatus,
    joinedAt: m.created_at.toISOString(),
    isInvite: false,
  }));

  const inviteRecords: MemberRecord[] = invites.map((inv) => ({
    id: inv.id,
    userId: null,
    email: inv.email,
    name: inv.email.split('@')[0],
    role: inv.role as MemberRole,
    status: 'Pending',
    joinedAt: inv.created_at.toISOString(),
    isInvite: true,
  }));

  return [...activeRecords, ...inviteRecords].sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
}

// ── Invite: look up or create user stub, then add membership ─────────────

export async function inviteMember(companyId: string, email: string, role: MemberRole) {
  const actorId = await requireSession();

  // Verify actor owns or is Admin of the company
  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { user_id: true, name: true } });
  if (!company) return { error: 'Company not found' };

  const isOwner = company.user_id === actorId;
  if (!isOwner) {
    const membership = await prisma.companyMember.findUnique({
      where: { user_id_company_id: { user_id: actorId, company_id: companyId } },
      select: { role: true },
    });
    if (!membership || membership.role !== 'Admin') return { error: 'Unauthorized' };
  }

  // Check if already an active member
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMember = await prisma.companyMember.findUnique({
      where: { user_id_company_id: { user_id: existingUser.id, company_id: companyId } },
    });
    if (existingMember) return { error: 'User is already a member of this workspace' };
  }

  // Check if already invited
  const existingInvite = await prisma.workspaceInvite.findUnique({
    where: { email_company_id: { email, company_id: companyId } }
  });
  if (existingInvite) return { error: 'User is already invited' };

  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const invite = await prisma.workspaceInvite.create({
    data: {
      email,
      company_id: companyId,
      role,
      token,
      expires_at: expiresAt,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const inviteUrl = `${appUrl}/invite/${token}`;

  try {
    const res = await resend.emails.send({
      from: 'GrantAI <onboarding@resend.dev>', // Use a verified domain in production
      to: email,
      subject: `You have been invited to join ${company.name} on GrantAI`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Join ${company.name} on GrantAI</h2>
          <p>You have been invited to collaborate on GrantAI.</p>
          <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #06b6d4; color: #020617; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px;">Accept Invitation</a>
          <p style="margin-top: 32px; font-size: 12px; color: #64748b;">If you did not expect this invitation, you can ignore this email.</p>
        </div>
      `,
    });
    console.log("[Resend] Sent invite to", email, res);
  } catch (err) {
    console.error("[Resend] Error sending email:", err);
  }

  revalidatePath('/settings/members');

  return {
    success: true,
    member: {
      id: invite.id,
      userId: null,
      email: invite.email,
      name: invite.email.split('@')[0],
      role: invite.role as MemberRole,
      status: 'Pending',
      joinedAt: invite.created_at.toISOString(),
      isInvite: true,
    } satisfies MemberRecord,
  };
}

// ── Update Role ───────────────────────────────────────────────────────────

export async function updateMemberRole(memberId: string, role: MemberRole) {
  const actorId = await requireSession();

  // First, check if it's an invite
  const invite = await prisma.workspaceInvite.findUnique({
    where: { id: memberId },
    include: { company: { select: { user_id: true } } }
  });

  if (invite) {
    const isOwner = invite.company.user_id === actorId;
    if (!isOwner) {
      const myRole = await prisma.companyMember.findUnique({
        where: { user_id_company_id: { user_id: actorId, company_id: invite.company_id } },
        select: { role: true },
      });
      if (!myRole || myRole.role !== 'Admin') return { error: 'Unauthorized' };
    }
    await prisma.workspaceInvite.update({ where: { id: memberId }, data: { role } });
    revalidatePath('/settings/members');
    return { success: true };
  }

  // If not an invite, check CompanyMember
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

  // First, check if it's an invite
  const invite = await prisma.workspaceInvite.findUnique({
    where: { id: memberId },
    include: { company: { select: { user_id: true } } }
  });

  if (invite) {
    const isOwner = invite.company.user_id === actorId;
    if (!isOwner) {
      const myRole = await prisma.companyMember.findUnique({
        where: { user_id_company_id: { user_id: actorId, company_id: invite.company_id } },
        select: { role: true },
      });
      if (!myRole || myRole.role !== 'Admin') return { error: 'Unauthorized' };
    }
    await prisma.workspaceInvite.delete({ where: { id: memberId } });
    revalidatePath('/settings/members');
    return { success: true };
  }

  // If not an invite, check CompanyMember
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

// ── Accept Invite ──────────────────────────────────────────────────────────

export async function acceptInvite(token: string, passedUserId?: string) {
  // Accept an optional pre-verified userId from the Server Component (page.tsx).
  // This is critical for production VPS where getServerSession() inside Server Actions
  // can return null due to cookie forwarding issues with Next.js App Router.
  let resolvedUserId = passedUserId;

  if (!resolvedUserId) {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return { error: 'Not_Authenticated' };
    resolvedUserId = (session!.user as any).id as string;
  }

  const user = await prisma.user.findUnique({ where: { id: resolvedUserId } });
  if (!user) return { error: 'User_Not_Found' };

  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    include: { company: true }
  });

  if (!invite) return { error: 'Invalid_Token' };

  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return { error: 'Email_Mismatch', message: `This invite was sent to ${invite.email}, but you are logged in as ${user.email}.` };
  }

  if (invite.expires_at < new Date()) {
    return { error: 'Token_Expired' };
  }

  const existingMember = await prisma.companyMember.findUnique({
    where: { user_id_company_id: { user_id: resolvedUserId, company_id: invite.company_id } }
  });

  if (!existingMember) {
    await prisma.companyMember.create({
      data: {
        user_id: resolvedUserId,
        company_id: invite.company_id,
        role: invite.role,
        status: 'Active'
      }
    });
  }

  await prisma.workspaceInvite.delete({ where: { id: invite.id } });

  return { success: true, companyId: invite.company_id };
}
