import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { normalizeToEngineeringEvents } from "@/lib/integrations/normalizer";
import type { LinearWebhookPayload } from "@/lib/integrations/types";

/**
 * POST /api/webhooks/linear
 *
 * Receives webhook events from Linear.
 *
 * Linear signs all webhook payloads with HMAC-SHA256.
 * The signature is sent in the `Linear-Signature` header.
 * Configure LINEAR_WEBHOOK_SECRET in your env to enable validation.
 *
 * Set up in Linear: Settings → API → Webhooks
 *   URL: https://your-domain.com/api/webhooks/linear
 *   Resources: Issues
 */
export async function POST(request: Request) {
  const bodyText = await request.text();

  // ── HMAC-SHA256 signature validation ─────────────────────────────────────────
  const webhookSecret = process.env.LINEAR_WEBHOOK_SECRET;
  const signatureHeader = request.headers.get("linear-signature");

  if (!webhookSecret) {
    console.error("[Linear Webhook] LINEAR_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Internal Server Configuration Error" },
      { status: 500 }
    );
  }

  if (!signatureHeader) {
    return NextResponse.json(
      { error: "Missing Linear-Signature header" },
      { status: 401 }
    );
  }

  const expectedSig = createHmac("sha256", webhookSecret)
    .update(bodyText)
    .digest("hex");

  const sigBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expectedSig);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  // ── Parse payload ────────────────────────────────────────────────────────────
  let payload: LinearWebhookPayload;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Linear sends type + action in the payload root
  const eventType = payload.type; // "Issue", "Comment", etc.

  // ── Find matching integration ────────────────────────────────────────────────
  const integration = await prisma.integration.findFirst({
    where: { provider: "linear", status: "active" },
    select: { id: true, company_id: true },
  });

  if (!integration) {
    return NextResponse.json(
      { received: true, processed: false, reason: "No active Linear integration" },
      { status: 200 }
    );
  }

  // ── Normalize ────────────────────────────────────────────────────────────────
  let normalizedEvents;
  try {
    normalizedEvents = normalizeToEngineeringEvents("linear", eventType, payload);
  } catch (err) {
    console.warn("[Linear Webhook] Normalization skipped:", err);
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
      console.error("[Linear Webhook] Failed to save event:", normalized.source_id, err);
    }
  }

  return NextResponse.json(
    { received: true, processed: true, eventCount: savedIds.length },
    { status: 200 }
  );
}
