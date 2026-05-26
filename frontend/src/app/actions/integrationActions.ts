'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { decrypt } from '@/lib/integrations/crypto';

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) throw new Error('Unauthorized');
  return (session.user as any).id as string;
}

async function verifyCompanyAccess(userId: string, companyId: string) {
  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      OR: [{ user_id: userId }, { members: { some: { user_id: userId } } }],
    },
    select: { id: true },
  });
  if (!company) throw new Error('Company not found or access denied');
  return company;
}

export interface AvailableRepo {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  isPrivate: boolean;
  isSelected: boolean;
  updatedAt: string;
}

/**
 * Fetches available GitHub repositories for the given workspace,
 * and marks which ones are currently selected for Magic Sync.
 */
export async function getAvailableGitHubRepos(companyId: string): Promise<{
  repos: AvailableRepo[];
  selectedRepos: string[];
}> {
  const userId = await requireSession();
  await verifyCompanyAccess(userId, companyId);

  const integration = await prisma.integration.findFirst({
    where: { company_id: companyId, provider: 'github', status: 'active' },
    select: { access_token: true, config: true },
  });

  if (!integration?.access_token) {
    throw new Error('GitHub not connected');
  }

  let accessToken: string;
  try {
    accessToken = decrypt(integration.access_token);
  } catch {
    throw new Error('Failed to decrypt GitHub token');
  }

  const config = integration.config as { selectedRepos?: string[] } | null;
  const selectedRepos = config?.selectedRepos ?? [];

  // Fetch all repos from GitHub (up to 100)
  const ghHeaders = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const res = await fetch(
    'https://api.github.com/user/repos?sort=pushed&per_page=100&type=owner',
    { headers: ghHeaders }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub API error: ${txt.slice(0, 200)}`);
  }

  const rawRepos = await res.json();
  const repos: AvailableRepo[] = rawRepos.map((r: any) => ({
    name: r.name,
    fullName: r.full_name,
    description: r.description ?? null,
    language: r.language ?? null,
    isPrivate: r.private ?? false,
    isSelected: selectedRepos.includes(r.name),
    updatedAt: r.pushed_at ?? r.updated_at ?? '',
  }));

  return { repos, selectedRepos };
}

/**
 * Updates the list of selected repositories for Magic Sync
 * in the Integration config JSON field.
 */
export async function updateGitHubSelectedRepos(
  companyId: string,
  repoNames: string[]
): Promise<{ success: boolean }> {
  const userId = await requireSession();
  await verifyCompanyAccess(userId, companyId);

  const integration = await prisma.integration.findFirst({
    where: { company_id: companyId, provider: 'github', status: 'active' },
    select: { id: true, config: true },
  });

  if (!integration) {
    throw new Error('GitHub integration not found');
  }

  const existingConfig = (integration.config as Record<string, unknown>) ?? {};

  await prisma.integration.update({
    where: { id: integration.id },
    data: {
      config: {
        ...existingConfig,
        selectedRepos: repoNames,
      },
    },
  });

  return { success: true };
}
