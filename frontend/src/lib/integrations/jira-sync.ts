/**
 * jira-sync.ts — Shared Jira data-fetching logic.
 *
 * Called directly from Server Actions (no HTTP round-trip to self).
 */

import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/integrations/crypto';

export interface JiraGroup {
  epic: string;
  items: { title: string; description: string; type: string }[];
}

export interface JiraSyncResult {
  groups: JiraGroup[];
  summary: string;
  cloudName: string;
  scannedSince: string;
  error?: string;
}

function extractAdfText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.text) return node.text;
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractAdfText).join(' ').trim();
  }
  return '';
}

export async function runJiraSync(
  companyId: string,
  userId: string,
  since?: string
): Promise<JiraSyncResult> {
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
    where: { company_id: companyId, provider: 'jira', status: 'active' },
    select: { access_token: true, config: true },
  });

  if (!integration?.access_token) throw new Error('Jira not connected');

  let accessToken: string;
  try {
    accessToken = decrypt(integration.access_token);
  } catch {
    throw new Error('Failed to decrypt Jira token');
  }

  const config = integration.config as any;
  const cloudSites: { id: string; name: string; url: string }[] = config?.cloudSites ?? [];

  let cloudId: string;
  let cloudName: string;

  if (cloudSites.length > 0) {
    cloudId = cloudSites[0].id;
    cloudName = cloudSites[0].name;
  } else {
    const sitesRes = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    });
    const sites = await sitesRes.json();
    if (!Array.isArray(sites) || sites.length === 0) {
      throw new Error('No Jira sites found for this account');
    }
    cloudId = sites[0].id;
    cloudName = sites[0].name;
  }

  const sinceDate = since
    ? since.slice(0, 10)
    : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const jql = encodeURIComponent(
    `statusCategory = Done AND updated >= "${sinceDate}" ORDER BY updated DESC`
  );
  const jiraApiBase = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3`;

  const searchRes = await fetch(
    `${jiraApiBase}/search?jql=${jql}&maxResults=100&fields=summary,description,issuetype,labels,parent,customfield_10014`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  );

  if (!searchRes.ok) {
    const txt = await searchRes.text();
    throw new Error(`Jira API error fetching issues: ${txt.slice(0, 200)}`);
  }

  const searchData = await searchRes.json();
  const raw = searchData.issues ?? [];

  interface JiraIssue { title: string; description: string | null; epic: string; type: string }
  const issues: JiraIssue[] = raw.map((issue: any) => {
    const fields = issue.fields ?? {};
    return {
      title: fields.summary ?? '',
      description: extractAdfText(fields.description),
      epic: fields.parent?.fields?.summary ?? fields.customfield_10014 ?? 'General',
      type: fields.issuetype?.name ?? 'Task',
    };
  });

  if (issues.length === 0) {
    return {
      groups: [],
      summary: `No completed Jira issues found for ${cloudName} in the last 90 days.`,
      cloudName,
      scannedSince: sinceDate,
    };
  }

  const byEpic = new Map<string, JiraIssue[]>();
  for (const issue of issues) {
    const existing = byEpic.get(issue.epic) ?? [];
    existing.push(issue);
    byEpic.set(issue.epic, existing);
  }

  const groups: JiraGroup[] = Array.from(byEpic.entries()).map(([epic, items]) => ({
    epic,
    items: items.map((i) => ({
      title: i.title,
      description: (i.description ?? '').slice(0, 500),
      type: i.type,
    })),
  }));

  const summary = [
    `Jira Cloud: ${cloudName}`,
    '',
    ...groups.map(
      (g) =>
        `Epic: ${g.epic}\n` +
        g.items
          .map((i) => `- [${i.type}] ${i.title}${i.description ? `: ${i.description.split('\n')[0]}` : ''}`)
          .join('\n')
    ),
  ].join('\n\n');

  return { groups, summary, cloudName, scannedSince: sinceDate };
}
