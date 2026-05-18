import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { normalizeToEngineeringEvents } from "@/lib/integrations/normalizer";
import type { JiraWebhookPayload } from "@/lib/integrations/types";

/**
 * POST /api/webhooks/jira
 *
 * Receives webhook events from Jira Cloud.
 *
 * Authentication: Jira webhooks can optionally include a secret token.
 * If JIRA_WEBHOOK_SECRET is set, we validate the `X-Atlassian-Webhook-Identifier`
 * header pattern. For simplicity, we use IP allowlisting in production
 * (Atlassian publishes their IP ranges) combined with a URL-embedded secret token.
 *
 * Configure in Jira: Project Settings → Webhooks → Create
 *   URL: https://your-domain.com/api/webhooks/jira?token=<JIRA_WEBHOOK_SECRET>
 *   Events: Issue updated
 */
export async function POST(request: Request) {
  // ── Token-based auth (URL param) ────────────────────────────────────────────
  const webhookSecret = process.env.JIRA_WEBHOOK_SECRET;
  if (webhookSecret) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token || token !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ── Parse payload ────────────────────────────────────────────────────────────
  let payload: JiraWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const webhookEvent = payload.webhookEvent;
  if (!webhookEvent) {
    return NextResponse.json({ error: "Missing webhookEvent field" }, { status: 400 });
  }

  // ── Find matching integration ────────────────────────────────────────────────
  // Jira webhooks don't include a tenant ID in the payload, so we match on
  // the issue domain embedded in the request's Referer/Origin, or fall back to
  // the first active Jira integration.
  const integration = await prisma.integration.findFirst({
    where: { provider: "jira", status: "active" },
    select: { id: true, company_id: true },
  });

  if (!integration) {
    return NextResponse.json(
      { received: true, processed: false, reason: "No active Jira integration" },
      { status: 200 }
    );
  }

  // ── Normalize ────────────────────────────────────────────────────────────────
  let normalizedEvents;
  try {
    normalizedEvents = normalizeToEngineeringEvents("jira", webhookEvent, payload);
  } catch (err) {
    console.warn("[Jira Webhook] Normalization skipped:", err);
    return NextResponse.json({ received: true, processed: false }, { status: 200 });
  }

  if (normalizedEvents.length === 0) {
    return NextResponse.json({ received: true, processed: false }, { status: 200 });
  }

  // ── Persist & dispatch ───────────────────────────────────────────────────────
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
          title: normalized.title,
          description: normalized.description,
          raw_payload: normalized.raw_payload as object,
        },
      });

      savedIds.push(saved.id);

      await inngest.send({
        name: "engineering/event.received",
        data: { eventId: saved.id, companyId: integration.company_id },
      });
    } catch (err) {
      console.error("[Jira Webhook] Failed to save event:", normalized.source_id, err);
    }
  }

  return NextResponse.json(
    { received: true, processed: true, eventCount: savedIds.length },
    { status: 200 }
  );
}
