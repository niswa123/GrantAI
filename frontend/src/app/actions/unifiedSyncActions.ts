'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export interface SyncSource {
  provider: 'github' | 'linear' | 'jira';
  connected: boolean;
  label: string;
  description: string;
}

export interface UnifiedSyncResult {
  success: boolean;
  claimsCreated: number;
  error?: string;
  sources: Array<{ provider: string; claims: number; error?: string }>;
}

/**
 * getConnectedSources — returns which providers the company has connected.
 * Used to populate the modal with the connection status cards.
 */
export async function getConnectedSources(companyId: string): Promise<SyncSource[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const integrations = await prisma.integration.findMany({
    where: { company_id: companyId, status: 'active' },
    select: { provider: true },
  });
  const connected = new Set(integrations.map((i) => i.provider));

  return [
    {
      provider: 'github',
      connected: connected.has('github'),
      label: 'GitHub',
      description: 'Commits & pull requests → R&D evidence',
    },
    {
      provider: 'linear',
      connected: connected.has('linear'),
      label: 'Linear',
      description: 'Engineering cycles & completed issues',
    },
    {
      provider: 'jira',
      connected: connected.has('jira'),
      label: 'Jira',
      description: 'Sprint epics & completed tickets',
    },
  ];
}

/**
 * runUnifiedSync — Server Action
 *
 * Orchestrates the full "Magic Sync" flow across ALL connected sources.
 * For each connected provider, fetches data and runs the AI pipeline.
 */
export async function runUnifiedSync(params: {
  companyId: string;
  salaryCosts: number;
  devCosts: number;
  baseUrl: string;
  isDeepSync?: boolean;
}): Promise<UnifiedSyncResult> {
  const { companyId, salaryCosts, devCosts, baseUrl, isDeepSync = false } = params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, claimsCreated: 0, error: 'Unauthorized', sources: [] };
  }

  // Build auth cookie header for internal fetch calls
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const fetchOpts = (body: object) => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify(body),
  });

  // Check which sources are connected
  const sources = await getConnectedSources(companyId);
  const connectedSources = sources.filter((s) => s.connected);

  if (connectedSources.length === 0) {
    return {
      success: false,
      claimsCreated: 0,
      error: 'No integrations connected. Go to Settings → Integrations to connect GitHub, Linear, or Jira.',
      sources: [],
    };
  }

  const costPerSource = salaryCosts / connectedSources.length;
  const devPerSource = devCosts / connectedSources.length;

  const results: UnifiedSyncResult['sources'] = [];
  let totalClaims = 0;

  // ── GitHub ──────────────────────────────────────────────────────────────────
  if (connectedSources.find((s) => s.provider === 'github')) {
    try {
      const syncRes = await fetch(`${baseUrl}/api/integrations/github/sync`, fetchOpts({ companyId }));
      if (!syncRes.ok) throw new Error((await syncRes.json().catch(() => ({}))).error ?? 'sync failed');

      const syncData = await syncRes.json();
      const commits: { repo: string; message: string }[] = syncData.commits ?? [];
      const repos = syncData.repos ?? [];

      if (commits.length > 0) {
        // Group by repo, analyze up to 5
        const commitsByRepo = new Map<string, string[]>();
        for (const c of commits) {
          const existing = commitsByRepo.get(c.repo) ?? [];
          existing.push(c.message.split('\n')[0].slice(0, 200));
          commitsByRepo.set(c.repo, existing);
        }

        const reposToAnalyze = Array.from(commitsByRepo.entries()).slice(0, 5);
        let claimed = 0;

        for (const [repoName, messages] of reposToAnalyze) {
          const repoMeta = repos.find((r: any) => r.name === repoName);
          const commitList = messages.slice(0, 40).map((m, i) => `${i + 1}. ${m}`).join('\n');
          const description = [
            `GitHub Repository: ${repoName}`,
            repoMeta?.language ? `Language: ${repoMeta.language}` : '',
            repoMeta?.description ? `Description: ${repoMeta.description}` : '',
            '',
            `Recent commits (${messages.length}):`,
            commitList,
          ].filter(Boolean).join('\n');

          if (description.length < 30) continue;

          const calcRes = await fetch(`${baseUrl}/api/calculate`, fetchOpts({
            description,
            salaryCosts: Math.max(costPerSource / reposToAnalyze.length, 1000),
            devCosts: Math.max(devPerSource / reposToAnalyze.length, 500),
            workspaceId: companyId,
            isSme: true,
          }));

          if (calcRes.ok) claimed++;
        }

        results.push({ provider: 'github', claims: claimed });
        totalClaims += claimed;
      } else {
        results.push({ provider: 'github', claims: 0, error: 'No commits in last 90 days' });
      }
    } catch (err: any) {
      results.push({ provider: 'github', claims: 0, error: err.message });
    }
  }

  // ── Linear ──────────────────────────────────────────────────────────────────
  if (connectedSources.find((s) => s.provider === 'linear')) {
    try {
      const syncRes = await fetch(`${baseUrl}/api/integrations/linear/sync`, fetchOpts({ companyId }));
      if (!syncRes.ok) throw new Error((await syncRes.json().catch(() => ({}))).error ?? 'sync failed');

      const syncData = await syncRes.json();
      const groups: { project: string; items: { title: string; description: string; labels: string }[] }[] =
        syncData.groups ?? [];

      if (groups.length > 0) {
        let claimed = 0;
        const groupsToAnalyze = groups.slice(0, 5);

        for (const group of groupsToAnalyze) {
          const issueList = group.items
            .slice(0, 30)
            .map((i, n) => `${n + 1}. ${i.title}${i.description ? ': ' + i.description.slice(0, 200) : ''}`)
            .join('\n');

          const description = [
            `Linear Project: ${group.project}`,
            '',
            `Completed engineering tasks (${group.items.length}):`,
            issueList,
          ].join('\n');

          if (description.length < 30) continue;

          const calcRes = await fetch(`${baseUrl}/api/calculate`, fetchOpts({
            description,
            salaryCosts: Math.max(costPerSource / groupsToAnalyze.length, 1000),
            devCosts: Math.max(devPerSource / groupsToAnalyze.length, 500),
            workspaceId: companyId,
            isSme: true,
          }));

          if (calcRes.ok) claimed++;
        }

        results.push({ provider: 'linear', claims: claimed });
        totalClaims += claimed;
      } else {
        results.push({ provider: 'linear', claims: 0, error: 'No completed issues in last 90 days' });
      }
    } catch (err: any) {
      results.push({ provider: 'linear', claims: 0, error: err.message });
    }
  }

  // ── Jira ────────────────────────────────────────────────────────────────────
  if (connectedSources.find((s) => s.provider === 'jira')) {
    try {
      const syncRes = await fetch(`${baseUrl}/api/integrations/jira/sync`, fetchOpts({ companyId }));
      if (!syncRes.ok) throw new Error((await syncRes.json().catch(() => ({}))).error ?? 'sync failed');

      const syncData = await syncRes.json();
      const groups: { epic: string; items: { title: string; description: string; type: string }[] }[] =
        syncData.groups ?? [];

      if (groups.length > 0) {
        let claimed = 0;
        const groupsToAnalyze = groups.slice(0, 5);

        for (const group of groupsToAnalyze) {
          const issueList = group.items
            .slice(0, 30)
            .map((i, n) => `${n + 1}. [${i.type}] ${i.title}${i.description ? ': ' + i.description.slice(0, 200) : ''}`)
            .join('\n');

          const description = [
            `Jira Epic: ${group.epic}`,
            '',
            `Completed sprint tasks (${group.items.length}):`,
            issueList,
          ].join('\n');

          if (description.length < 30) continue;

          const calcRes = await fetch(`${baseUrl}/api/calculate`, fetchOpts({
            description,
            salaryCosts: Math.max(costPerSource / groupsToAnalyze.length, 1000),
            devCosts: Math.max(devPerSource / groupsToAnalyze.length, 500),
            workspaceId: companyId,
            isSme: true,
          }));

          if (calcRes.ok) claimed++;
        }

        results.push({ provider: 'jira', claims: claimed });
        totalClaims += claimed;
      } else {
        results.push({ provider: 'jira', claims: 0, error: 'No completed Jira issues in last 90 days' });
      }
    } catch (err: any) {
      results.push({ provider: 'jira', claims: 0, error: err.message });
    }
  }

  return {
    success: totalClaims > 0,
    claimsCreated: totalClaims,
    error: totalClaims === 0 ? 'No R&D activities identified across connected sources.' : undefined,
    sources: results,
  };
}
