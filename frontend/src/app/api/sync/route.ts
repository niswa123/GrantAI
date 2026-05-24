import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { runGithubSync } from '@/lib/integrations/github-sync';
import { runLinearSync } from '@/lib/integrations/linear-sync';
import { runJiraSync } from '@/lib/integrations/jira-sync';
import { runRdPipeline, formatClaimForStorage } from '@/lib/rd-engine/pipeline';
import { computeCredit } from '@/lib/rd-engine/credit-calculator';
import { getUserAccessLevel } from '@/lib/access-control';

// Extend the default route segment config to allow long-running requests
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

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
    'españa': 'ES',
  };
  return map[countryName.toLowerCase().trim()] ?? 'DEFAULT';
}

/**
 * POST /api/sync
 *
 * Runs the unified sync pipeline as a **streaming SSE** response.
 * This keeps the connection alive with heartbeats so proxies/browsers
 * don't kill it during the long AI pipeline processing.
 *
 * Body: { companyId, salaryCosts, devCosts, isDeepSync? }
 */
export async function POST(request: Request) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { companyId, salaryCosts, devCosts, isDeepSync = false } = body;
  if (!companyId) {
    return NextResponse.json({ success: false, error: 'Missing companyId' }, { status: 400 });
  }

  // ── Access control ─────────────────────────────────────────────────────────
  const access = await getUserAccessLevel(userId);
  if (!access.hasAccess) {
    return NextResponse.json({
      success: false,
      claimsCreated: 0,
      error: access.isFreeTierLimitReached
        ? 'You have reached the limit of 3 free AI claims. Please upgrade to a premium tier.'
        : 'Payment Required. Please upgrade to a premium tier to generate claims.',
      sources: [],
    });
  }

  // ── Set up SSE stream ─────────────────────────────────────────────────────
  const encoder = new TextEncoder();
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      // Helper: send an SSE event
      function send(event: string, data: any) {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Stream already closed
        }
      }

      // Heartbeat every 10s to keep connection alive through proxies
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
        }
      }, 10_000);

      try {
        send('status', { message: 'Starting sync...' });

        // ── Country code ──────────────────────────────────────────────────
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
          // Non-fatal
        }

        // ── Connected sources ─────────────────────────────────────────────
        const integrations = await prisma.integration.findMany({
          where: { company_id: companyId, status: 'active' },
          select: { provider: true },
        });
        const connected = new Set(integrations.map((i) => i.provider));
        const connectedProviders = ['github', 'linear', 'jira'].filter((p) => connected.has(p));

        if (connectedProviders.length === 0) {
          send('done', {
            success: false,
            claimsCreated: 0,
            error: 'No integrations connected. Go to Settings → Integrations to connect GitHub, Linear, or Jira.',
            sources: [],
          });
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          controller.close();
          return;
        }

        const costPerSource = salaryCosts / connectedProviders.length;
        const devPerSource = devCosts / connectedProviders.length;
        const timeframeDays = isDeepSync ? 365 : 90;
        const sinceDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000).toISOString();

        const results: Array<{ provider: string; claims: number; error?: string }> = [];
        let totalClaims = 0;

        // ── Run calculation helper ────────────────────────────────────────
        async function runCalculation(
          description: string,
          salary: number,
          dev: number,
          label: string
        ): Promise<boolean> {
          try {
            send('status', { message: `AI analyzing: ${label}...` });

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
              true
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

            send('status', { message: `Completed: ${label} (score: ${pipeline.classification.rd_score})` });
            return true;
          } catch (err: any) {
            console.error('[API Sync] runCalculation failed:', err?.message);
            send('status', { message: `Warning: failed to analyze ${label}` });
            return false;
          }
        }

        // ── GitHub ────────────────────────────────────────────────────────
        if (connected.has('github')) {
          send('status', { message: 'Fetching GitHub repositories...' });
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

              send('status', { message: `Found ${commits.length} commits across ${commitsByRepo.size} repos. Analyzing top ${reposToAnalyze.length}...` });

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
                const ok = await runCalculation(description, salary, dev, `GitHub: ${repoName}`);
                if (ok) claimed++;
              }

              results.push({ provider: 'github', claims: claimed });
              totalClaims += claimed;
            } else {
              results.push({ provider: 'github', claims: 0, error: `No commits in last ${timeframeDays} days` });
            }
          } catch (err: any) {
            results.push({ provider: 'github', claims: 0, error: err.message });
            send('status', { message: `GitHub error: ${err.message}` });
          }
        }

        // ── Linear ────────────────────────────────────────────────────────
        if (connected.has('linear')) {
          send('status', { message: 'Fetching Linear issues...' });
          try {
            const syncData = await runLinearSync(companyId, userId, sinceDate);
            const groups = syncData.groups;

            if (groups.length > 0) {
              let claimed = 0;
              const groupsToAnalyze = groups.slice(0, 5);

              send('status', { message: `Found ${groups.length} Linear projects. Analyzing top ${groupsToAnalyze.length}...` });

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
                const ok = await runCalculation(description, salary, dev, `Linear: ${group.project}`);
                if (ok) claimed++;
              }

              results.push({ provider: 'linear', claims: claimed });
              totalClaims += claimed;
            } else {
              results.push({ provider: 'linear', claims: 0, error: `No completed Linear issues in last ${timeframeDays} days` });
            }
          } catch (err: any) {
            results.push({ provider: 'linear', claims: 0, error: err.message });
            send('status', { message: `Linear error: ${err.message}` });
          }
        }

        // ── Jira ──────────────────────────────────────────────────────────
        if (connected.has('jira')) {
          send('status', { message: 'Fetching Jira issues...' });
          try {
            const syncData = await runJiraSync(companyId, userId, sinceDate);
            const groups = syncData.groups;

            if (groups.length > 0) {
              let claimed = 0;
              const groupsToAnalyze = groups.slice(0, 5);

              send('status', { message: `Found ${groups.length} Jira epics. Analyzing top ${groupsToAnalyze.length}...` });

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
                const ok = await runCalculation(description, salary, dev, `Jira: ${group.epic}`);
                if (ok) claimed++;
              }

              results.push({ provider: 'jira', claims: claimed });
              totalClaims += claimed;
            } else {
              results.push({ provider: 'jira', claims: 0, error: `No completed Jira issues in last ${timeframeDays} days` });
            }
          } catch (err: any) {
            results.push({ provider: 'jira', claims: 0, error: err.message });
            send('status', { message: `Jira error: ${err.message}` });
          }
        }

        // ── Final result ──────────────────────────────────────────────────
        const criticalError = results.find(
          (r) => r.error && !r.error.includes('No commits') && !r.error.includes('No completed')
        )?.error;

        let finalError: string | undefined;
        if (totalClaims === 0) {
          if (criticalError) {
            finalError = criticalError;
          } else {
            finalError = isDeepSync
              ? 'No recent commits or completed tasks found in the last 365 days across connected sources.'
              : 'No recent commits or completed tasks found in the last 90 days. Try a Deep Audit.';
          }
        }

        send('done', {
          success: totalClaims > 0,
          claimsCreated: totalClaims,
          error: finalError,
          sources: results,
        });
      } catch (err: any) {
        send('done', {
          success: false,
          claimsCreated: 0,
          error: err?.message || 'Unexpected sync error',
          sources: [],
        });
      } finally {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
