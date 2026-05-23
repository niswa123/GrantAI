/**
 * POST /api/analyze-log
 *
 * Accepts a daily work log (plain text), sends it to an LLM for R&D classification,
 * then runs the value calculator to produce a monetary estimate.
 *
 * Request body:
 *   { "text": "description of work done today", "teamDailyRate"?: number }
 *
 * Response:
 *   {
 *     "id": "uuid",
 *     "date": "ISO string",
 *     "inputText": "...",
 *     "classification": "R&D" | "Not R&D",
 *     "explanation": "...",
 *     "confidenceScore": 0.0–1.0,
 *     "criteriaScores": { ... },
 *     "rdValue": number (€),
 *     "teamDailyRate": number,
 *     "model": "string",
 *     "latencyMs": number
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { classifyWorkLog, type LlmClassificationResult } from '@/lib/llm/classifier';
import { calculateRdValue } from '@/lib/calculator/value-calculator';

// Default team daily rate (€) — MVP hardcode, can be overridden per request
const DEFAULT_TEAM_DAILY_RATE = 800;

export async function POST(request: NextRequest) {
  try {
    // ── Auth & Access Control ──────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { getUserAccessLevel } = await import("@/lib/access-control");
    const access = await getUserAccessLevel(userId);

    if (!access.hasAccess) {
      const errorMsg = access.isFreeTierLimitReached
        ? "You have reached the limit of 3 free AI analyses. Please upgrade to a premium tier for unlimited logs."
        : "Payment Required. Please upgrade to a premium tier for unlimited logs.";
      return NextResponse.json(
        { error: errorMsg },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { text, teamDailyRate } = body;

    // ── Validation ───────────────────────────────────────────
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty "text" field. Please provide a work description.' },
        { status: 400 },
      );
    }

    if (text.trim().length < 10) {
      return NextResponse.json(
        { error: 'Work description is too short. Please provide at least 10 characters.' },
        { status: 400 },
      );
    }

    if (text.length > 10_000) {
      return NextResponse.json(
        { error: 'Work description is too long. Maximum 10,000 characters.' },
        { status: 400 },
      );
    }

    const rate = typeof teamDailyRate === 'number' && teamDailyRate > 0
      ? teamDailyRate
      : DEFAULT_TEAM_DAILY_RATE;

    // ── Step 1: LLM Classification ──────────────────────────
    const startTime = Date.now();
    const llmResult: LlmClassificationResult = await classifyWorkLog(text.trim());
    const latencyMs = Date.now() - startTime;

    // ── Step 2: Value Calculation ────────────────────────────
    const rdValue = calculateRdValue({
      isRd: llmResult.classification === 'R&D',
      confidenceScore: llmResult.confidenceScore,
      teamDailyRate: rate,
    });

    // ── Step 3: Build Response ───────────────────────────────
    const logEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      inputText: text.trim(),
      classification: llmResult.classification,
      explanation: llmResult.explanation,
      confidenceScore: llmResult.confidenceScore,
      criteriaScores: llmResult.criteriaScores,
      rdValue,
      teamDailyRate: rate,
      model: llmResult.model,
      latencyMs,
    };

    return NextResponse.json(logEntry, { status: 200 });
  } catch (error: unknown) {
    console.error('[analyze-log] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 },
    );
  }
}
