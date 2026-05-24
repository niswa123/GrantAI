import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { normalizeToEngineeringEvents } from "@/lib/integrations/normalizer";

/**
 * POST /api/webhooks/github
 *
 * Receives webhook events from GitHub. Validates the HMAC-SHA256 signature,
 * normalizes the payload into EngineeringEvents, and triggers background
 * AI analysis via Inngest.
 *
 * Configure the webhook URL in your GitHub App / repo settings:
 *   https://your-domain.com/api/webhooks/github
 *
 * Content type must be application/json.
 * Required events: push, pull_request
 */
export async function POST(request: Request) {
  // ── Read body as text for signature verification ────────────────────────────
  const bodyText = await request.text();

  // ── Validate HMAC-SHA256 signature ──────────────────────────────────────────
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  const signatureHeader = request.headers.get("x-hub-signature-256");

  if (!webhookSecret) {
    console.error("[GitHub Webhook] GITHUB_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Internal Server Configuration Error" },
      { status: 500 }
    );
  }

  if (!signatureHeader) {
    return NextResponse.json(
      { error: "Missing X-Hub-Signature-256 header" },
      { status: 401 }
    );
  }

  const expectedSignature =
    "sha256=" +
    createHmac("sha256", webhookSecret).update(bodyText).digest("hex");

  const sigBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  // ── Parse and validate event headers ───────────────────────────────────────
  const githubEvent = request.headers.get("x-github-event");
  if (!githubEvent) {
    return NextResponse.json(
      { error: "Missing X-GitHub-Event header" },
      { status: 400 }
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // ── Identify the integration from the repository ───────────────────────────
  const repoFullName = (payload as any)?.repository?.full_name as string | undefined;

  // We look up an active GitHub integration for the repo. In the config JSON
  // we store { repositories: ["owner/repo"] } when the user connects repos.
  // For now, find any active GitHub integration that includes this repo, or
  // the first active GitHub integration as fallback.
  let integration: { id: string; company_id: string } | null = null;

  if (repoFullName) {
    integration = await prisma.integration.findFirst({
      where: {
        provider: "github",
        status: "active",
        config: { path: ["repositories"], array_contains: repoFullName },
      },
      select: { id: true, company_id: true },
    });
  }

  // Fallback: first active GitHub integration (useful before repo list is configured)
  if (!integration) {
    integration = await prisma.integration.findFirst({
      where: { provider: "github", status: "active" },
      select: { id: true, company_id: true },
    });
  }

  if (!integration) {
    // No integration found — acknowledge receipt but skip processing
    return NextResponse.json(
      { received: true, processed: false, reason: "No matching integration" },
      { status: 200 }
    );
  }

  // ── Normalize into EngineeringEvents ────────────────────────────────────────
  let normalizedEvents;
  try {
    normalizedEvents = normalizeToEngineeringEvents("github", githubEvent, payload);
  } catch (err) {
    // Unknown/unsupported events — still return 200 so GitHub doesn't retry
    console.warn("[GitHub Webhook] Normalization skipped:", err);
    return NextResponse.json({ received: true, processed: false }, { status: 200 });
  }

  if (normalizedEvents.length === 0) {
    // Event type is recognized but doesn't produce an event (e.g., unmerged PR close)
    return NextResponse.json({ received: true, processed: false }, { status: 200 });
  }

  // ── Persist events and dispatch AI analysis jobs ────────────────────────────
  const savedIds: string[] = [];

  for (const normalized of normalizedEvents) {
    try {
      const saved = await prisma.engineeringEvent.upsert({
        where: {
          integration_id_source_id: {
            integration_id: integration.id,
            source_id: normalized.source_id,
          },
        },
        create: {
          company_id: integration.company_id,
          integration_id: integration.id,
          event_type: normalized.event_type,
          source_id: normalized.source_id,
          title: normalized.title,
          description: normalized.description,
          author_email: normalized.author_email,
          event_timestamp: normalized.event_timestamp,
          raw_payload: normalized.raw_payload as object,
          status: "pending",
        },
        update: {
          // On duplicate, update the payload in case it was amended (e.g. force-push)
          title: normalized.title,
          description: normalized.description,
          raw_payload: normalized.raw_payload as object,
        },
      });

      savedIds.push(saved.id);

      // Dispatch background AI analysis via Inngest (fire and forget)
      await inngest.send({
        name: "engineering/event.received",
        data: { eventId: saved.id, companyId: integration.company_id },
      });
    } catch (err) {
      console.error("[GitHub Webhook] Failed to save event:", normalized.source_id, err);
    }
  }

  return NextResponse.json(
    { received: true, processed: true, eventCount: savedIds.length },
    { status: 200 }
  );
}
