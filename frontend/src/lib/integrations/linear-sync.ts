/**
 * linear-sync.ts — Shared Linear data-fetching logic.
 *
 * Called directly from Server Actions (no HTTP round-trip to self).
 */

import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/integrations/crypto';

const LINEAR_GRAPHQL = 'https://api.linear.app/graphql';

export interface LinearGroup {
  project: string;
  items: { title: string; description: string; labels: string }[];
}

export interface LinearSyncResult {
  groups: LinearGroup[];
  summary: string;
  scannedSince: string;
  error?: string;
}

export async function runLinearSync(
  companyId: string,
  userId: string,
  since?: string
): Promise<LinearSyncResult> {
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
    where: { company_id: companyId, provider: 'linear', status: 'active' },
    select: { access_token: true },
  });

  if (!integration?.access_token) throw new Error('Linear not connected');

  let accessToken: string;
  try {
    accessToken = decrypt(integration.access_token);
  } catch {
    throw new Error('Failed to decrypt Linear token');
  }

  const sinceDate = since
    ? since.slice(0, 10)
    : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const query = `
    query RecentIssues($since: TimelessDate!) {
      issues(
        filter: {
          completedAt: { gte: $since }
          state: { type: { eq: "completed" } }
        }
        first: 100
        orderBy: updatedAt
      ) {
        nodes {
          id
          title
          description
          priority
          project { name }
          team { name }
          labels { nodes { name } }
        }
      }
    }
  `;

  const gqlRes = await fetch(LINEAR_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, variables: { since: sinceDate } }),
  });

  const gqlData = await gqlRes.json();
  if (gqlData.errors) {
    throw new Error(`Linear API error: ${JSON.stringify(gqlData.errors).slice(0, 200)}`);
  }

  const raw = gqlData.data?.issues?.nodes ?? [];
  const issues: { title: string; description: string | null; project: string; labels: string[] }[] =
    raw.map((i: any) => ({
      title: i.title ?? '',
      description: i.description ?? null,
      project: i.project?.name ?? 'General',
      labels: (i.labels?.nodes ?? []).map((l: any) => l.name),
    }));

  if (issues.length === 0) {
    return { groups: [], summary: 'No completed issues found.', scannedSince: sinceDate };
  }

  const byProject = new Map<string, typeof issues>();
  for (const issue of issues) {
    const existing = byProject.get(issue.project) ?? [];
    existing.push(issue);
    byProject.set(issue.project, existing);
  }

  const groups: LinearGroup[] = Array.from(byProject.entries()).map(([project, items]) => ({
    project,
    items: items.map((i) => ({
      title: i.title,
      description: (i.description ?? '').slice(0, 500),
      labels: i.labels.join(', '),
    })),
  }));

  const summary = groups
    .map(
      (g) =>
        `Project: ${g.project}\n` +
        g.items.map((i) => `- ${i.title}${i.description ? `: ${i.description.split('\n')[0]}` : ''}`).join('\n')
    )
    .join('\n\n');

  return { groups, summary, scannedSince: sinceDate };
}
