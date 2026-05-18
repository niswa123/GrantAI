import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/integrations/crypto";

const LINEAR_GRAPHQL = "https://api.linear.app/graphql";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/integrations/linear/sync
 *
 * Fetches recent issues from Linear using the stored OAuth token.
 * Groups results by Project for the AI analysis pipeline.
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
    where: { 
      id: companyId,
      OR: [
        { user_id: session.user.id },
        { members: { some: { user_id: session.user.id } } }
      ]
    },
    select: { id: true, name: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  // Load stored encrypted token
  const integration = await prisma.integration.findFirst({
    where: { company_id: companyId, provider: "linear", status: "active" },
    select: { access_token: true },
  });
  if (!integration?.access_token) {
    return NextResponse.json({ error: "Linear not connected" }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = decrypt(integration.access_token);
  } catch {
    return NextResponse.json({ error: "Failed to decrypt token" }, { status: 500 });
  }

  const sinceDate = since ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Fetch completed issues from Linear via GraphQL
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

  let issues: { title: string; description: string | null; project: string; team: string; labels: string[] }[] = [];

  try {
    const gqlRes = await fetch(LINEAR_GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query, variables: { since: sinceDate } }),
    });

    const gqlData = await gqlRes.json();
    if (gqlData.errors) {
      console.error("[Linear Sync] GraphQL errors:", gqlData.errors);
      return NextResponse.json({ error: "Linear API error" }, { status: 502 });
    }

    const raw = gqlData.data?.issues?.nodes ?? [];
    issues = raw.map((i: any) => ({
      title: i.title ?? "",
      description: i.description ?? null,
      project: i.project?.name ?? "General",
      team: i.team?.name ?? "Engineering",
      labels: (i.labels?.nodes ?? []).map((l: any) => l.name),
    }));
  } catch (err) {
    console.error("[Linear Sync] Exception:", err);
    return NextResponse.json({ error: "Network error fetching Linear issues" }, { status: 502 });
  }

  if (issues.length === 0) {
    return NextResponse.json({ issues: [], groups: [], summary: "No completed issues found in the last 90 days." });
  }

  // Group by project name
  const byProject = new Map<string, typeof issues>();
  for (const issue of issues) {
    const existing = byProject.get(issue.project) ?? [];
    existing.push(issue);
    byProject.set(issue.project, existing);
  }

  const groups = Array.from(byProject.entries()).map(([project, items]) => ({
    project,
    items: items.map((i) => ({
      title: i.title,
      description: i.description?.slice(0, 500) ?? "",
      labels: i.labels.join(", "),
    })),
  }));

  const summary = groups
    .map(
      (g) =>
        `Project: ${g.project}\n` +
        g.items.map((i) => `- ${i.title}${i.description ? `: ${i.description.split("\n")[0]}` : ""}`).join("\n")
    )
    .join("\n\n");

  return NextResponse.json({ issues, groups, summary, scannedSince: sinceDate });
}
