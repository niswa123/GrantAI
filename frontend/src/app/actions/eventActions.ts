"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  analyzeEngineeringEvent,
  type AnalyzeEventResult,
} from "@/lib/rd-engine/event-analyzer";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Verify the current user owns or is a member of the company that owns the event.
 * Returns the userId or throws.
 */
async function verifyEventOwnership(eventId: string): Promise<string> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    throw new Error("Not authenticated");
  }

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
    throw new Error("Event not found");
  }

  const isOwner = event.company.user_id === userId;
  const isMember = event.company.members.length > 0;

  if (!isOwner && !isMember) {
    throw new Error("Access denied");
  }

  return userId;
}

async function verifyCompanyAccess(companyId: string): Promise<string> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      user_id: true,
      members: {
        where: { user_id: userId, status: "Active" },
        select: { id: true },
      },
    },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  const isOwner = company.user_id === userId;
  const isMember = company.members.length > 0;

  if (!isOwner && !isMember) {
    throw new Error("Access denied");
  }

  return userId;
}

// ─── Analyze Single Event ───────────────────────────────────────────────────

export async function analyzeEvent(
  eventId: string
): Promise<{ success: true; result: AnalyzeEventResult } | { success: false; error: string }> {
  try {
    await verifyEventOwnership(eventId);
    const result = await analyzeEngineeringEvent(eventId);
    return { success: true, result };
  } catch (error: any) {
    console.error("[analyzeEvent] Error:", error);
    return { success: false, error: error.message || "Analysis failed" };
  }
}

// ─── Bulk Analyze Pending Events ────────────────────────────────────────────

export interface BulkAnalyzeResult {
  total: number;
  analyzed: number;
  failed: number;
  skipped: number;
  results: Array<{
    eventId: string;
    success: boolean;
    error?: string;
  }>;
}

export async function analyzePendingEvents(
  companyId: string
): Promise<{ success: true; result: BulkAnalyzeResult } | { success: false; error: string }> {
  try {
    await verifyCompanyAccess(companyId);

    // Fetch up to 50 pending events
    const pendingEvents = await prisma.engineeringEvent.findMany({
      where: {
        company_id: companyId,
        status: "pending",
      },
      select: { id: true },
      take: 50,
      orderBy: { event_timestamp: "desc" },
    });

    const result: BulkAnalyzeResult = {
      total: pendingEvents.length,
      analyzed: 0,
      failed: 0,
      skipped: 0,
      results: [],
    };

    // Process sequentially to respect LLM rate limits
    for (const event of pendingEvents) {
      try {
        await analyzeEngineeringEvent(event.id);
        result.analyzed++;
        result.results.push({ eventId: event.id, success: true });
      } catch (err: any) {
        // If already analyzed (race condition), skip
        if (err.message?.includes("already analyzed")) {
          result.skipped++;
          result.results.push({ eventId: event.id, success: true });
        } else {
          result.failed++;
          result.results.push({
            eventId: event.id,
            success: false,
            error: err.message,
          });
        }
      }
    }

    return { success: true, result };
  } catch (error: any) {
    console.error("[analyzePendingEvents] Error:", error);
    return { success: false, error: error.message || "Bulk analysis failed" };
  }
}

// ─── Override Classification (Feedback Loop) ────────────────────────────────

export async function overrideClassification(
  analyzedLogId: string,
  isRd: boolean,
  reason?: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // Find the analyzed log and verify ownership through its event
    const log = await prisma.analyzedLog.findUnique({
      where: { id: analyzedLogId },
      select: { event_id: true },
    });

    if (!log) {
      throw new Error("Analyzed log not found");
    }

    await verifyEventOwnership(log.event_id);

    // Update: set override and also update the is_rd field
    // so downstream calculations reflect the correction
    await prisma.analyzedLog.update({
      where: { id: analyzedLogId },
      data: {
        user_override: isRd,
        override_reason: reason || null,
        is_rd: isRd, // Reflect override in the main field
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("[overrideClassification] Error:", error);
    return { success: false, error: error.message || "Override failed" };
  }
}

// ─── Fetch Events with Analysis Status ──────────────────────────────────────

export async function getCompanyEvents(
  companyId: string,
  options?: { status?: string; page?: number; pageSize?: number }
) {
  try {
    await verifyCompanyAccess(companyId);

    const page = options?.page ?? 1;
    const pageSize = Math.min(options?.pageSize ?? 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = { company_id: companyId };
    if (options?.status) {
      where.status = options.status;
    }

    const [events, totalItems] = await Promise.all([
      prisma.engineeringEvent.findMany({
        where,
        include: {
          analyzed_log: {
            select: {
              id: true,
              is_rd: true,
              confidence_score: true,
              complexity_weight: true,
              justification: true,
              calculated_value: true,
              model_used: true,
              user_override: true,
              override_reason: true,
              created_at: true,
            },
          },
        },
        orderBy: { event_timestamp: "desc" },
        take: pageSize,
        skip,
      }),
      prisma.engineeringEvent.count({ where }),
    ]);

    return {
      success: true as const,
      data: events,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  } catch (error: any) {
    console.error("[getCompanyEvents] Error:", error);
    return { success: false as const, error: error.message };
  }
}
