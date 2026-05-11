/**
 * POST /api/calculate
 *
 * Production-grade R&D Tax Credit calculation endpoint.
 * Uses the two-pass LLM pipeline + deterministic credit calculator.
 *
 * Pipeline:
 *   1. Validate input
 *   2. Determine country from workspace
 *   3. Pass 1 LLM: Classify R&D eligibility (Chain-of-Thought scoring)
 *   4. Deterministic: Compute credit amount from tax rules (no LLM)
 *   5. Pass 2 LLM: Generate formal audit-proof claim text
 *   6. Persist result to DB
 *   7. Return structured response
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { runRdPipeline } from "@/lib/rd-engine/pipeline";
import { computeCredit } from "@/lib/rd-engine/credit-calculator";

// ─── Input Validation ───────────────────────────────────────────────────────

function validateInput(body: unknown): {
  description: string;
  salaryCosts: number;
  devCosts: number;
  workspaceId?: string;
  isSme: boolean;
} | { error: string; status: number } {
  if (typeof body !== "object" || body === null) {
    return { error: "Invalid request body.", status: 400 };
  }

  const b = body as Record<string, unknown>;

  const description = typeof b.description === "string" ? b.description.trim() : "";
  if (description.length < 30) {
    return {
      error: "Project description must be at least 30 characters for accurate AI analysis.",
      status: 400,
    };
  }
  if (description.length > 10_000) {
    return { error: "Project description exceeds maximum length of 10,000 characters.", status: 400 };
  }

  const salaryCosts = typeof b.salaryCosts === "number" ? b.salaryCosts : parseFloat(String(b.salaryCosts ?? 0));
  const devCosts = typeof b.devCosts === "number" ? b.devCosts : parseFloat(String(b.devCosts ?? 0));

  if (isNaN(salaryCosts) || salaryCosts < 0) {
    return { error: "Invalid salary costs value.", status: 400 };
  }
  if (isNaN(devCosts) || devCosts < 0) {
    return { error: "Invalid development costs value.", status: 400 };
  }
  if (salaryCosts + devCosts <= 0) {
    return { error: "At least one cost category must have a positive value.", status: 400 };
  }

  const workspaceId = typeof b.workspaceId === "string" ? b.workspaceId : undefined;
  const isSme = b.isSme === true;

  return { description, salaryCosts, devCosts, workspaceId, isSme };
}

// ─── UUID validation ────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─── Route Handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const requestStart = Date.now();

  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    // ── Parse & Validate Input ────────────────────────────────────────────
    const rawBody = await request.json().catch(() => null);
    const validated = validateInput(rawBody);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: validated.status });
    }

    const { description, salaryCosts, devCosts, workspaceId, isSme } = validated;

    // ── Determine Country from Workspace ───────────────────────────────────
    let countryCode = "DEFAULT";
    let validCompanyId: string | null = null;

    if (workspaceId && UUID_RE.test(workspaceId)) {
      validCompanyId = workspaceId;
      try {
        const company = await prisma.company.findUnique({
          where: { id: workspaceId },
          select: { country: true },
        });
        if (company?.country) {
          // Normalize country name → ISO code
          countryCode = normalizeCountryToCode(company.country);
        }
      } catch {
        // Non-fatal: fall back to DEFAULT rules
        console.warn("[calculate] Could not fetch company country, using DEFAULT rules.");
      }
    }

    // ── Pass 1 + Pass 2: LLM Pipeline ─────────────────────────────────────
    const pipeline = await runRdPipeline({
      description,
      salaryCosts,
      devCosts,
      countryCode,
    });

    // ── Credit Calculation (Deterministic) ─────────────────────────────────
    const credit = computeCredit(
      countryCode,
      {
        salary: salaryCosts,
        contractor: devCosts,
        materials: 0,
        software: 0,
      },
      isSme
    );

    // ── Format claim text for storage ──────────────────────────────────────
    const claimTextForStorage = formatClaimForStorage(pipeline);

    // ── Persist to Database ────────────────────────────────────────────────
    const claim = await prisma.claim.create({
      data: {
        description,
        total_salary_cost: salaryCosts,
        total_dev_cost: devCosts,
        estimated_rd_amount: credit.creditAmount,
        rd_score: pipeline.classification.rd_score,
        claim_text: claimTextForStorage,
        status: "Draft",
        company_id: validCompanyId,
      },
    });

    // ── Structured Response ────────────────────────────────────────────────
    return NextResponse.json(
      {
        id: claim.id,
        date: new Date().toISOString(),

        // Input echo
        description,
        salaryCosts,
        devCosts,
        totalCosts: salaryCosts + devCosts,

        // Classification result
        classification: pipeline.classification.is_rd_eligible ? "R&D" : "Not R&D",
        confidenceScore: pipeline.classification.rd_score,
        criteriaScores: pipeline.classification.criteria_scores,
        keyInnovations: pipeline.classification.key_innovations,
        disqualifyingFactors: pipeline.classification.disqualifying_factors_found,
        riskFlags: pipeline.classification.risk_flags,
        recommendedEvidence: pipeline.classification.recommended_evidence,
        chainOfThought: pipeline.classification.step_by_step_analysis,

        // Credit calculation
        estimatedRefund: credit.creditAmount,
        qualifyingExpenditure: credit.qualifyingExpenditure,
        appliedCreditRate: credit.appliedRate,
        program: credit.program,
        creditBreakdown: credit.breakdown,
        tieredBreakdown: credit.tieredBreakdown,
        smeApplied: credit.smeApplied,

        // Claim text
        draftClaim: pipeline.claimText.claim_text,
        claimMetadata: pipeline.claimText.metadata,

        // Performance
        model: "KIE.AI Gemini 3 Flash (2-pass pipeline)",
        latencyMs: Date.now() - requestStart,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[calculate] Pipeline error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: `Calculation failed: ${message}` },
      { status: 500 }
    );
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Map full country names (stored in DB) to ISO codes for the tax rules engine.
 */
function normalizeCountryToCode(countryName: string): string {
  const map: Record<string, string> = {
    netherlands: "NL",
    "united kingdom": "UK",
    "great britain": "UK",
    france: "FR",
    germany: "DE",
    deutschland: "DE",
  };
  return map[countryName.toLowerCase().trim()] ?? "DEFAULT";
}

/**
 * Serialize the LLM claim result into clean Markdown for DB storage and UI rendering.
 */
function formatClaimForStorage(pipeline: Awaited<ReturnType<typeof runRdPipeline>>): string {
  const ct = pipeline.claimText.claim_text;
  const parts: string[] = [];

  // Company Overview
  if (ct.company_overview) {
    parts.push(`## Company Overview\n\n${ct.company_overview}`);
  }

  // Project Descriptions
  for (const p of (ct.project_descriptions || [])) {
    const sections: string[] = [`## Project: ${p.project_title || "Unnamed Project"}`];
    if (p.technological_baseline) sections.push(`**Technological Baseline**\n\n${p.technological_baseline}`);
    if (p.objectives)             sections.push(`**Technical Objectives**\n\n${p.objectives}`);
    if (p.technical_challenges)   sections.push(`**Technical Challenges**\n\n${p.technical_challenges}`);
    if (p.methodology_and_iterations) sections.push(`**Methodology & Iterations**\n\n${p.methodology_and_iterations}`);
    if (p.outcomes)               sections.push(`**Outcomes**\n\n${p.outcomes}`);
    parts.push(sections.join("\n\n"));
  }

  // Technological Advancement
  if (ct.technological_advancement_statement) {
    parts.push(`## Technological Advancement\n\n${ct.technological_advancement_statement}`);
  }

  // Technological Uncertainty
  if (ct.technological_uncertainty_statement) {
    parts.push(`## Technological Uncertainty\n\n${ct.technological_uncertainty_statement}`);
  }

  // Expenditure Justification
  if (ct.expenditure_justification) {
    parts.push(`## Expenditure Justification\n\n${ct.expenditure_justification}`);
  }

  return parts.join("\n\n---\n\n");
}

