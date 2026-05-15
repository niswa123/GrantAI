/**
 * POST /api/feedback
 *
 * Saves user feedback on AI classification to improve future results.
 * Called when user clicks thumbs up/down on a claim result.
 *
 * Body: { claimId: string, userIsRd: boolean }
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { claimId, userIsRd } = body;

    if (!claimId || typeof userIsRd !== "boolean") {
      return NextResponse.json(
        { error: "Missing claimId or userIsRd" },
        { status: 400 }
      );
    }

    // Update claim status based on user feedback
    // Approved = user confirms it IS R&D
    // Draft = user says it's NOT R&D (revert)
    const newStatus = userIsRd ? "Approved" : "Draft";

    const updated = await prisma.claim.update({
      where: { id: claimId },
      data: { status: newStatus },
      select: { id: true, status: true, rd_score: true },
    });

    return NextResponse.json({
      success: true,
      claimId: updated.id,
      newStatus: updated.status,
      message: userIsRd
        ? "Feedback saved: marked as R&D. This will improve future classifications."
        : "Feedback saved: marked as Not R&D. This will improve future classifications.",
    });
  } catch (err) {
    console.error("[feedback] Error:", err);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback/stats
 * Returns feedback statistics for a workspace.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    const claims = await prisma.claim.findMany({
      where: workspaceId ? { company_id: workspaceId } : {},
      select: { rd_score: true, status: true },
    });

    const total = claims.length;
    const approved = claims.filter((c) => c.status === "Approved").length;
    const submitted = claims.filter((c) => c.status === "Submitted").length;
    const avgScore =
      total > 0
        ? claims.reduce((s, c) => s + (c.rd_score ?? 0), 0) / total
        : 0;

    // AI accuracy: how often AI score >= 0.5 matches user approval
    const withFeedback = claims.filter(
      (c) => c.status === "Approved" || c.status === "Draft"
    );
    const correct = withFeedback.filter(
      (c) =>
        (c.status === "Approved" && (c.rd_score ?? 0) >= 0.5) ||
        (c.status === "Draft" && (c.rd_score ?? 0) < 0.5)
    ).length;
    const accuracy =
      withFeedback.length > 0 ? correct / withFeedback.length : null;

    return NextResponse.json({
      total,
      approved,
      submitted,
      avgScore: Math.round(avgScore * 100) / 100,
      aiAccuracy: accuracy ? Math.round(accuracy * 100) : null,
      feedbackCount: withFeedback.length,
    });
  } catch (err) {
    console.error("[feedback/stats] Error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
