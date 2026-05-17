import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/integrations/crypto";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/integrations/jira/sync
 *
 * Fetches recently completed Jira issues using the stored OAuth token.
 * Groups results by Epic for the AI analysis pipeline.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { companyId?: string; since?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { companyId, since } = body;
  if (!companyId || !UUID_REGEX.test(companyId)) {
    return NextResponse.json({ error: "Invalid companyId" }, { status: 400 });
  }

  // Verify company ownership
  const company = await prisma.company.findFirst({
    where: { id: companyId, user_id: session.user.id },
    select: { id: true, name: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  // Load stored encrypted token + cloud site config
  const integration = await prisma.integration.findFirst({
    where: { company_id: companyId, provider: "jira", status: "active" },
    select: { access_token: true, config: true },
  });
  if (!integration?.access_token) {
    return NextResponse.json({ error: "Jira not connected" }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = decrypt(integration.access_token);
  } catch {
    return NextResponse.json({ error: "Failed to decrypt token" }, { status: 500 });
  }

  // Extract cloud ID from saved config
  const config = integration.config as any;
  const cloudSites: { id: string; name: string; url: string }[] = config?.cloudSites ?? [];

  let cloudId: string;
  let cloudName: string;

  if (cloudSites.length > 0) {
    cloudId = cloudSites[0].id;
    cloudName = cloudSites[0].name;
  } else {
    // Fallback: fetch cloud sites dynamically if not stored
    try {
      const sitesRes = await fetch("https://api.atlassian.com/oauth/token/accessible-resources", {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      });
      const sites = await sitesRes.json();
      if (!Array.isArray(sites) || sites.length === 0) {
        return NextResponse.json({ error: "No Jira sites found for this account" }, { status: 400 });
      }
      cloudId = sites[0].id;
      cloudName = sites[0].name;
    } catch {
      return NextResponse.json({ error: "Failed to fetch Jira cloud sites" }, { status: 502 });
    }
  }

  const sinceDate = since ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Fetch issues via JQL — completed work in the last 90 days
  const jql = encodeURIComponent(
    `statusCategory = Done AND updated >= "${sinceDate}" ORDER BY updated DESC`
  );
  const jiraApiBase = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3`;

  interface JiraIssue {
    title: string;
    description: string | null;
    epic: string;
    type: string;
    labels: string[];
  }

  let issues: JiraIssue[] = [];

  try {
    const searchRes = await fetch(
      `${jiraApiBase}/search?jql=${jql}&maxResults=100&fields=summary,description,issuetype,labels,parent,customfield_10014`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!searchRes.ok) {
      const txt = await searchRes.text();
      console.error("[Jira Sync] Search failed:", txt);
      return NextResponse.json({ error: "Jira API error fetching issues" }, { status: 502 });
    }

    const searchData = await searchRes.json();
    const raw = searchData.issues ?? [];

    issues = raw.map((issue: any) => {
      const fields = issue.fields ?? {};
      // Extract plain text from Atlassian Document Format (ADF) description
      const descText = extractAdfText(fields.description);
      return {
        title: fields.summary ?? "",
        description: descText,
        epic: fields.parent?.fields?.summary ?? fields.customfield_10014 ?? "General",
        type: fields.issuetype?.name ?? "Task",
        labels: (fields.labels ?? []) as string[],
      };
    });
  } catch (err) {
    console.error("[Jira Sync] Exception:", err);
    return NextResponse.json({ error: "Network error fetching Jira issues" }, { status: 502 });
  }

  if (issues.length === 0) {
    return NextResponse.json({
      issues: [],
      groups: [],
      summary: `No completed Jira issues found for ${cloudName} in the last 90 days.`,
    });
  }

  // Group by Epic
  const byEpic = new Map<string, JiraIssue[]>();
  for (const issue of issues) {
    const existing = byEpic.get(issue.epic) ?? [];
    existing.push(issue);
    byEpic.set(issue.epic, existing);
  }

  const groups = Array.from(byEpic.entries()).map(([epic, items]) => ({
    epic,
    items: items.map((i) => ({
      title: i.title,
      description: i.description?.slice(0, 500) ?? "",
      type: i.type,
    })),
  }));

  const summary = [
    `Jira Cloud: ${cloudName}`,
    "",
    ...groups.map(
      (g) =>
        `Epic: ${g.epic}\n` +
        g.items
          .map((i) => `- [${i.type}] ${i.title}${i.description ? `: ${i.description.split("\n")[0]}` : ""}`)
          .join("\n")
    ),
  ].join("\n\n");

  return NextResponse.json({ issues, groups, summary, cloudName, scannedSince: sinceDate });
}

// ── Helper: Extract plain text from Atlassian Document Format (ADF) ──────────

function extractAdfText(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.text) return node.text;
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractAdfText).join(" ").trim();
  }
  return "";
}
