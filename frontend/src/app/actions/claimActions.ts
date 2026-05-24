'use server';

import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/action-guard';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getDashboardClaims(companyId?: string) {
  const session = await getServerSession(authOptions);

  const targetCompanyId = companyId || (session?.user as any)?.defaultCompanyId;

  if (!targetCompanyId || !UUID_REGEX.test(targetCompanyId)) {
    return [];
  }

  const dbClaims = await prisma.claim.findMany({
    where: { company_id: targetCompanyId },
    orderBy: { created_at: 'desc' },
  });

  return dbClaims.map(c => ({
    id: c.id,
    date: c.created_at.toISOString(),
    description: c.description,
    estimatedRefund: Number(c.estimated_rd_amount || 0),
    classification: (c.rd_score || 0) >= 0.5 ? 'R&D' : 'Not R&D',
    confidenceScore: c.rd_score || 0,
    totalCosts: Number(c.total_salary_cost) + Number(c.total_dev_cost),
    salaryCosts: Number(c.total_salary_cost),
    devCosts: Number(c.total_dev_cost),
    status: c.status as any,
    workspaceId: c.company_id || undefined,
  }));
}

export async function updateClaimStatus(claimId: string, status: string) {
  try {
    await requireAuth();
  } catch {
    return { error: 'Unauthorized' };
  }

  try {
    const updated = await prisma.claim.update({
      where: { id: claimId },
      data: { status },
    });
    return { success: true, status: updated.status };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteClaim(claimId: string) {
  try {
    await requireAuth();
  } catch {
    return { error: 'Unauthorized' };
  }

  try {
    await prisma.claim.delete({
      where: { id: claimId },
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getLatestClaimId(companyId: string): Promise<string | null> {
  if (!companyId || !UUID_REGEX.test(companyId)) return null;

  try {
    const claim = await prisma.claim.findFirst({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
      select: { id: true },
    });
    return claim?.id ?? null;
  } catch {
    return null;
  }
}
