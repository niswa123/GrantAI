/**
 * POST /api/events/[id]/analyze
 *
 * Triggers R&D classification for a single EngineeringEvent.
 *
 * Response (200):
 *   { analyzedLogId, isRd, confidenceScore, complexityWeight, justification, calculatedValue, model }
 *
 * Error responses:
 *   400 — Missing event ID
 *   404 — Event not found
 *   409 — Event already analyzed
 *   500 — Analysis failed
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { analyzeEngineeringEvent } from "@/lib/rd-engine/event-analyzer";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing event ID" } },
        { status: 400 }
      );
    }

    // Verify ownership
    const event = await prisma.engineeringEvent.findUnique({
      where: { id: eventId },
      select: {
        company: {
          select: {
            user_id: true,
            members: {
              where: { user_id: userId, status: "Active" },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Event not found" } },
        { status: 404 }
      );
    }

    const isOwner = event.company.user_id === userId;
    const isMember = event.company.members.length > 0;
    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    // Run analysis
    const result = await analyzeEngineeringEvent(eventId);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";

    // Distinguish already-analyzed from other errors
    if (message.includes("already analyzed")) {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "Event has already been analyzed" } },
        { status: 409 }
      );
    }

    console.error("[POST /api/events/[id]/analyze]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: `Analysis failed: ${message}` } },
      { status: 500 }
    );
  }
}
