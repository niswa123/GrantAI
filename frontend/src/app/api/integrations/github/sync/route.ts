import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/integrations/crypto";

/**
 * POST /api/integrations/github/sync
 *
 * Fetches repos and recent commits from GitHub using the stored OAuth token,
 * then returns structured data ready for the AI analysis pipeline.
 *
 * Body: { companyId: string, since?: string (ISO date) }
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
  if (!companyId) {
    return NextResponse.json({ error: "companyId is required" }, { status: 400 });
  }

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(companyId)) {
    return NextResponse.json({ error: "Invalid companyId" }, { status: 400 });
  }

  // ── Verify company belongs to user ──────────────────────────────────────────
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

  // ── Load stored encrypted token ──────────────────────────────────────────────
  const integration = await prisma.integration.findFirst({
    where: { company_id: companyId, provider: "github", status: "active" },
    select: { access_token: true },
  });
  if (!integration?.access_token) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = decrypt(integration.access_token);
  } catch {
    return NextResponse.json({ error: "Failed to decrypt token" }, { status: 500 });
  }

  const ghHeaders = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // ── Fetch repos (up to 30, sorted by push date) ──────────────────────────────
  let repos: { id: number; name: string; full_name: string; description: string | null; language: string | null }[] = [];
  try {
    const reposRes = await fetch(
      "https://api.github.com/user/repos?sort=pushed&per_page=30&type=owner",
      { headers: ghHeaders }
    );
    if (!reposRes.ok) {
      const txt = await reposRes.text();
      console.error("[GitHub Sync] Repos fetch failed:", txt);
      return NextResponse.json({ error: "GitHub API error fetching repos" }, { status: 502 });
    }
    const raw = await reposRes.json();
    repos = raw.map((r: any) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description ?? null,
      language: r.language ?? null,
    }));
  } catch (err) {
    console.error("[GitHub Sync] Repos exception:", err);
    return NextResponse.json({ error: "Network error fetching repos" }, { status: 502 });
  }

  if (repos.length === 0) {
    return NextResponse.json({ repos: [], commits: [], summary: "No repositories found." });
  }

  // ── Fetch commits for each repo (last 90 days by default) ────────────────────
  const sinceDate = since ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const allCommits: { repo: string; sha: string; message: string; date: string; author: string }[] = [];

  // Fetch commits from up to 10 repos in parallel to stay fast
  const reposToScan = repos.slice(0, 10);
  await Promise.allSettled(
    reposToScan.map(async (repo) => {
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
            sha: c.sha?.slice(0, 7) ?? "",
            message: c.commit?.message ?? "",
            date: c.commit?.author?.date ?? "",
            author: c.commit?.author?.name ?? "",
          });
        }
      } catch {
        // Silently skip repos we cannot access (private, rate-limited, etc.)
      }
    })
  );

  // ── Build a compact text summary for the AI ───────────────────────────────────
  const repoList = repos
    .slice(0, 10)
    .map((r) => `- ${r.name} (${r.language ?? "unknown"})${r.description ? ": " + r.description : ""}`)
    .join("\n");

  const commitSample = allCommits
    .slice(0, 60) // Keep the prompt size manageable
    .map((c) => `[${c.repo}] ${c.message.split("\n")[0].slice(0, 120)}`)
    .join("\n");

  const summary = [
    `Company: ${company.name}`,
    `Repositories (${repos.length} total, showing top 10):`,
    repoList,
    "",
    `Recent commits since ${sinceDate.slice(0, 10)} (${allCommits.length} total, showing first 60):`,
    commitSample,
  ].join("\n");

  return NextResponse.json({
    repos,
    commits: allCommits,
    summary,
    scannedSince: sinceDate,
  });
}
