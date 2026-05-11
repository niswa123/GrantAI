'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function getDashboardClaims(companyId?: string) {
  const session = await getServerSession(authOptions);
  
  // For MVP, if not logged in, we might just return empty array or allow seeing local claims?
  // Let's enforce that to see DB claims, you must be logged in, or we return anonymous claims.
  
  const targetCompanyId = companyId || (session?.user as any)?.defaultCompanyId;

  // Validate UUID to prevent Prisma crash on mock workspaces (e.g. "ws_1")
  const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const validCompanyId = targetCompanyId && isUuid(targetCompanyId) ? targetCompanyId : null;

  const dbClaims = await prisma.claim.findMany({
    where: { company_id: validCompanyId },
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
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized' };

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
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.claim.delete({
      where: { id: claimId },
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
