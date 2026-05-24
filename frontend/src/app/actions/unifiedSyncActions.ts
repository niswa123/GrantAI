'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { runGithubSync } from '@/lib/integrations/github-sync';
import { runLinearSync } from '@/lib/integrations/linear-sync';
import { runJiraSync } from '@/lib/integrations/jira-sync';
import { runRdPipeline, formatClaimForStorage } from '@/lib/rd-engine/pipeline';
import { computeCredit } from '@/lib/rd-engine/credit-calculator';

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

// ── Country normalization ────────────────────────────────────────────────────

function normalizeCountryToCode(countryName: string): string {
  const map: Record<string, string> = {
    netherlands: 'NL',
    'united kingdom': 'UK',
    'great britain': 'UK',
    france: 'FR',
    germany: 'DE',
    deutschland: 'DE',
    belgium: 'BE',
    belgique: 'BE',
    sweden: 'SE',
    sverige: 'SE',
    ireland: 'IE',
    spain: 'ES',
    españa: 'ES',
  };
  return map[countryName.toLowerCase().trim()] ?? 'DEFAULT';
}

// ── Auth helper ──────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) throw new Error('Unauthorized');
  return { userId, session };
}

/**
 * getConnectedSources — returns which providers the company has connected.
 */
export async function getConnectedSources(companyId: string): Promise<SyncSource[]> {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) return [];

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
 * Calls integration logic DIRECTLY (no HTTP self-fetch) to avoid network
 * round-trip issues on self-hosted VPS deployments.
 */
export async function runUnifiedSync(params: {
  companyId: string;
  salaryCosts: number;
  devCosts: number;
  baseUrl: string; // kept for API compatibility, no longer used for self-fetch
  isDeepSync?: boolean;
}): Promise<UnifiedSyncResult> {
  const { companyId, salaryCosts, devCosts, isDeepSync = false } = params;

  const { userId } = await requireSession();

  // Fetch user's access level
  const { getUserAccessLevel } = await import('@/lib/access-control');
  const access = await getUserAccessLevel(userId);
  if (!access.hasAccess) {
    return {
      success: false,
      claimsCreated: 0,
      error: access.isFreeTierLimitReached
        ? 'You have reached the limit of 3 free AI claims. Please upgrade to a premium tier.'
        : 'Payment Required. Please upgrade to a premium tier to generate claims.',
      sources: [],
    };
  }

  // Determine company country for tax rules
  let countryCode = 'DEFAULT';
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { country: true },
    });
    if (company?.country) {
      countryCode = normalizeCountryToCode(company.country);
    }
  } catch {
    // Non-fatal — fall back to DEFAULT
  }

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
  const timeframeDays = isDeepSync ? 365 : 90;
  const sinceDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000).toISOString();

  const results: UnifiedSyncResult['sources'] = [];
  let totalClaims = 0;

  /**
   * runCalculation — calls the R&D pipeline and persists the claim directly,
   * without going through the HTTP /api/calculate route.
   */
  async function runCalculation(description: string, salary: number, dev: number): Promise<boolean> {
    try {
      const pipeline = await runRdPipeline({
        description,
        salaryCosts: salary,
        devCosts: dev,
        countryCode,
        workspaceId: companyId,
      });

      const credit = computeCredit(
        countryCode,
        { salary, contractor: dev, materials: 0, software: 0 },
        true // isSme
      );

      await prisma.claim.create({
        data: {
          description,
          total_salary_cost: salary,
          total_dev_cost: dev,
          estimated_rd_amount: credit.creditAmount,
          rd_score: pipeline.classification.rd_score,
          claim_text: formatClaimForStorage(pipeline),
          status: 'Draft',
          company_id: companyId,
        },
      });

      return true;
    } catch (err: any) {
      console.error('[UnifiedSync] runCalculation failed:', err?.message);
      return false;
    }
  }

  // ── GitHub ──────────────────────────────────────────────────────────────────
  if (connectedSources.find((s) => s.provider === 'github')) {
    try {
      const syncData = await runGithubSync(companyId, userId, sinceDate);
      const commits = syncData.commits;

      if (commits.length > 0) {
        const commitsByRepo = new Map<string, string[]>();
        for (const c of commits) {
          const existing = commitsByRepo.get(c.repo) ?? [];
          existing.push(c.message.split('\n')[0].slice(0, 200));
          commitsByRepo.set(c.repo, existing);
        }

        const reposToAnalyze = Array.from(commitsByRepo.entries()).slice(0, 5);
        let claimed = 0;

        for (const [repoName, messages] of reposToAnalyze) {
          const repoMeta = syncData.repos.find((r) => r.name === repoName);
          const commitList = messages.slice(0, 40).map((m, i) => `${i + 1}. ${m}`).join('\n');
          const description = [
            `GitHub Repository: ${repoName}`,
            repoMeta?.language ? `Language: ${repoMeta.language}` : '',
            repoMeta?.description ? `Description: ${repoMeta.description}` : '',
            '',
            `Recent commits (${messages.length}):`,
            commitList,
          ]
            .filter(Boolean)
            .join('\n');

          if (description.length < 30) continue;

          const salary = Math.max(costPerSource / reposToAnalyze.length, 1000);
          const dev = Math.max(devPerSource / reposToAnalyze.length, 500);
          const ok = await runCalculation(description, salary, dev);
          if (ok) claimed++;
        }

        results.push({ provider: 'github', claims: claimed });
        totalClaims += claimed;
      } else {
        results.push({ provider: 'github', claims: 0, error: `No commits in last ${timeframeDays} days` });
      }
    } catch (err: any) {
      results.push({ provider: 'github', claims: 0, error: err.message });
    }
  }

  // ── Linear ──────────────────────────────────────────────────────────────────
  if (connectedSources.find((s) => s.provider === 'linear')) {
    try {
      const syncData = await runLinearSync(companyId, userId, sinceDate);
      const groups = syncData.groups;

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

          const salary = Math.max(costPerSource / groupsToAnalyze.length, 1000);
          const dev = Math.max(devPerSource / groupsToAnalyze.length, 500);
          const ok = await runCalculation(description, salary, dev);
          if (ok) claimed++;
        }

        results.push({ provider: 'linear', claims: claimed });
        totalClaims += claimed;
      } else {
        results.push({ provider: 'linear', claims: 0, error: `No completed Linear issues in last ${timeframeDays} days` });
      }
    } catch (err: any) {
      results.push({ provider: 'linear', claims: 0, error: err.message });
    }
  }

  // ── Jira ────────────────────────────────────────────────────────────────────
  if (connectedSources.find((s) => s.provider === 'jira')) {
    try {
      const syncData = await runJiraSync(companyId, userId, sinceDate);
      const groups = syncData.groups;

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
            `Cloud: ${syncData.cloudName}`,
            '',
            `Completed issues (${group.items.length}):`,
            issueList,
          ].join('\n');

          if (description.length < 30) continue;

          const salary = Math.max(costPerSource / groupsToAnalyze.length, 1000);
          const dev = Math.max(devPerSource / groupsToAnalyze.length, 500);
          const ok = await runCalculation(description, salary, dev);
          if (ok) claimed++;
        }

        results.push({ provider: 'jira', claims: claimed });
        totalClaims += claimed;
      } else {
        results.push({ provider: 'jira', claims: 0, error: `No completed Jira issues in last ${timeframeDays} days` });
      }
    } catch (err: any) {
      results.push({ provider: 'jira', claims: 0, error: err.message });
    }
  }

  // ── Determine final error message ────────────────────────────────────────────
  const criticalError = results.find(
    (r) => r.error && !r.error.includes('No commits') && !r.error.includes('No completed')
  )?.error;

  let finalError: string | undefined;
  if (totalClaims === 0) {
    if (criticalError) {
      finalError = criticalError;
    } else {
      finalError = isDeepSync
        ? 'No recent commits or completed tasks found in the last 365 days across connected sources. Please verify that your connected repositories or projects have active development.'
        : 'No recent commits or completed tasks found in the last 90 days across connected sources. Please commit some new code or try running a Deep Audit to scan the last 365 days.';
    }
  }

  return {
    success: totalClaims > 0,
    claimsCreated: totalClaims,
    error: finalError,
    sources: results,
  };
}
