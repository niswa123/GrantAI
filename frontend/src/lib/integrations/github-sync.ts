/**
 * github-sync.ts — Shared GitHub data-fetching logic.
 *
 * Called directly from Server Actions (no HTTP round-trip to self).
 */

import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/integrations/crypto';

export interface GithubSyncResult {
  repos: { name: string; language: string | null; description: string | null }[];
  commits: { repo: string; sha: string; message: string; date: string; author: string }[];
  summary: string;
  scannedSince: string;
  error?: string;
}

export async function runGithubSync(
  companyId: string,
  userId: string,
  since?: string
): Promise<GithubSyncResult> {
  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      OR: [
        { user_id: userId },
        { members: { some: { user_id: userId } } },
      ],
    },
    select: { id: true, name: true },
  });

  if (!company) throw new Error('Company not found');

  const integration = await prisma.integration.findFirst({
    where: { company_id: companyId, provider: 'github', status: 'active' },
    select: { access_token: true, config: true },
  });

  if (!integration?.access_token) throw new Error('GitHub not connected');

  let accessToken: string;
  try {
    accessToken = decrypt(integration.access_token);
  } catch {
    throw new Error('Failed to decrypt GitHub token');
  }

  const ghHeaders = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Get selected repos from integration config
  const config = integration.config as { selectedRepos?: string[] } | null;
  const selectedRepoNames = config?.selectedRepos ?? [];

  // If user hasn't selected any repos, surface a clear message instead of scanning everything
  if (selectedRepoNames.length === 0) {
    return {
      repos: [],
      commits: [],
      summary: 'No repositories selected for Magic Sync. Please go to Settings → Integrations to choose which repositories to track.',
      scannedSince: since ?? '',
      error: 'NO_REPOS_SELECTED',
    };
  }

  // Fetch repos
  const reposRes = await fetch(
    'https://api.github.com/user/repos?sort=pushed&per_page=100&type=owner',
    { headers: ghHeaders }
  );

  if (!reposRes.ok) {
    const txt = await reposRes.text();
    throw new Error(`GitHub API error fetching repos: ${txt.slice(0, 200)}`);
  }

  const rawRepos = await reposRes.json();

  // Filter to only selected repos
  const filteredRawRepos = rawRepos.filter((r: any) => selectedRepoNames.includes(r.name));

  const repos: GithubSyncResult['repos'] = filteredRawRepos.map((r: any) => ({
    name: r.name,
    full_name: r.full_name,
    language: r.language ?? null,
    description: r.description ?? null,
  }));

  if (repos.length === 0) {
    return { repos: [], commits: [], summary: 'None of the selected repositories were found in your GitHub account.', scannedSince: since ?? '' };
  }

  const sinceDate = since ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const allCommits: GithubSyncResult['commits'] = [];

  await Promise.allSettled(
    filteredRawRepos.map(async (repo: any) => {
      try {
        const commitsRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?since=${sinceDate}&per_page=50`,
          { headers: ghHeaders }
        );
        if (!commitsRes.ok) return;
        const raw = await commitsRes.json();
        if (!Array.isArray(raw)) return;
        for (const c of raw) {
          allCommits.push({
            repo: repo.name,
            sha: c.sha?.slice(0, 7) ?? '',
            message: c.commit?.message ?? '',
            date: c.commit?.author?.date ?? '',
            author: c.commit?.author?.name ?? '',
          });
        }
      } catch {
        // skip repos we can't access
      }
    })
  );

  const repoList = repos
    .slice(0, 10)
    .map((r) => `- ${r.name} (${r.language ?? 'unknown'})${r.description ? ': ' + r.description : ''}`)
    .join('\n');

  const commitSample = allCommits
    .slice(0, 60)
    .map((c) => `[${c.repo}] ${c.message.split('\n')[0].slice(0, 120)}`)
    .join('\n');

  const summary = [
    `Company: ${company.name}`,
    `Repositories (${repos.length} total, showing top 10):`,
    repoList,
    '',
    `Recent commits since ${sinceDate.slice(0, 10)} (${allCommits.length} total, showing first 60):`,
    commitSample,
  ].join('\n');

  return { repos, commits: allCommits, summary, scannedSince: sinceDate };
}
