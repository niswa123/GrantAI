'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

import { cookies } from 'next/headers';

export type GitHubSyncStatus =
  | { stage: 'idle' }
  | { stage: 'fetching' }
  | { stage: 'analyzing'; repoCount: number; commitCount: number }
  | { stage: 'done'; claimsCreated: number }
  | { stage: 'error'; message: string };

export interface GitHubSyncResult {
  success: boolean;
  claimsCreated: number;
  error?: string;
}

/**
 * runGitHubSync — Server Action
 *
 * Orchestrates the full "Magic Sync" flow:
 * 1. Fetches repos + commits from GitHub via our /api/integrations/github/sync endpoint
 * 2. Groups commits by repository as separate "projects"
 * 3. Calls /api/calculate for each repo group to run the full AI pipeline
 * 4. Returns a summary of how many claims were created
 *
 * Each repo becomes one Claim on the dashboard — grouped by repository name,
 * with all commit messages used as the R&D project description.
 */
export async function runGitHubSync(params: {
  companyId: string;
  salaryCosts: number;
  devCosts: number;
  baseUrl: string;
}): Promise<GitHubSyncResult> {
  const { companyId, salaryCosts, devCosts, baseUrl } = params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, claimsCreated: 0, error: 'Unauthorized' };
  }

  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();

  // ── Step 1: Fetch repos + commits from GitHub ────────────────────────────────
  let syncData: {
    repos: { name: string; language: string | null; description: string | null }[];
    commits: { repo: string; message: string; date: string }[];
    summary: string;
  };

  try {
    const syncRes = await fetch(`${baseUrl}/api/integrations/github/sync`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify({ companyId }),
    });

    if (!syncRes.ok) {
      const err = await syncRes.json().catch(() => ({ error: 'GitHub sync failed' }));
      return { success: false, claimsCreated: 0, error: err.error ?? 'GitHub sync failed' };
    }

    syncData = await syncRes.json();
  } catch (err: any) {
    return { success: false, claimsCreated: 0, error: `Network error: ${err.message}` };
  }

  if (!syncData.commits.length) {
    return { success: false, claimsCreated: 0, error: 'No commits found in the last 90 days.' };
  }

  // ── Step 2: Group commits by repository ─────────────────────────────────────
  const commitsByRepo = new Map<string, string[]>();
  for (const commit of syncData.commits) {
    const existing = commitsByRepo.get(commit.repo) ?? [];
    existing.push(commit.message.split('\n')[0].slice(0, 200)); // First line only
    commitsByRepo.set(commit.repo, existing);
  }

  // ── Step 3: Run AI analysis for each repo (up to 5 to stay within limits) ────
  const reposToAnalyze = Array.from(commitsByRepo.entries()).slice(0, 5);
  let claimsCreated = 0;

  for (const [repoName, messages] of reposToAnalyze) {
    // Find repo metadata
    const repoMeta = syncData.repos.find((r) => r.name === repoName);

    // Build a rich project description from commit messages
    const commitList = messages.slice(0, 40).map((m, i) => `${i + 1}. ${m}`).join('\n');
    const description = [
      `Repository: ${repoName}`,
      repoMeta?.language ? `Primary language: ${repoMeta.language}` : '',
      repoMeta?.description ? `Description: ${repoMeta.description}` : '',
      '',
      `Recent engineering work (${messages.length} commits):`,
      commitList,
    ]
      .filter(Boolean)
      .join('\n');

    // Skip if description is too short for meaningful analysis
    if (description.length < 30) continue;

    try {
      const calcRes = await fetch(`${baseUrl}/api/calculate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': cookieHeader
        },
        body: JSON.stringify({
          description,
          salaryCosts: Math.max(salaryCosts / reposToAnalyze.length, 1000),
          devCosts: Math.max(devCosts / reposToAnalyze.length, 500),
          workspaceId: companyId,
          isSme: true,
        }),
      });

      if (calcRes.ok) {
        claimsCreated++;
      } else {
        const errBody = await calcRes.json().catch(() => null);
        console.error(`[GitHubSync] Claim failed for ${repoName}:`, errBody);
      }
    } catch (err) {
      console.error(`[GitHubSync] Exception for ${repoName}:`, err);
    }
  }

  if (claimsCreated === 0) {
    return {
      success: false,
      claimsCreated: 0,
      error: 'AI analysis did not identify any R&D activities. Try adding salary and dev costs.',
    };
  }

  return { success: true, claimsCreated };
}
