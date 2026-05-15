/**
 * R&D AI Pipeline — The Core Scoring & Generation Engine
 *
 * Architecture: Two-pass LLM pipeline
 *   Pass 1: CLASSIFY — Rigorous R&D eligibility scoring (Chain-of-Thought)
 *   Pass 2: GENERATE — Formal audit-proof claim text generation
 *
 * The credit calculation is DETERMINISTIC (no LLM) via credit-calculator.ts
 */

import { callLlm, LlmApiError } from "./llm-client";
import type { RdClassificationResult, ClaimGenerationResult } from "./types";
import { getTaxRules } from "@/lib/rd-engine/legal_rules/tax-rules.registry";
import { buildDynamicFewShotContext } from "./feedback-store";

// ─── Pass 1: Classify Project ──────────────────────────────────────────────

const CLASSIFY_SYSTEM = `You are a Senior Big 4 R&D Tax Credit Director with 20+ years of experience defending claims before HMRC, Belastingdienst, DGFiP, and Finanzamt.

Your sole purpose: rigorously evaluate whether a project meets the OECD Frascati Manual definition of R&D.

CRITICAL DIRECTIVES — READ CAREFULLY:
1. Be a SKEPTIC. Not a cheerleader. If in doubt, mark lower.
2. BUSINESS NOVELTY ≠ TECHNOLOGICAL NOVELTY. Building a new app using existing frameworks is NOT R&D. Solving a genuinely unsolved technical problem IS.
3. TECHNICAL UNCERTAINTY is the most important criterion. It must be GENUINE uncertainty that a competent engineer in the field could not resolve using existing published knowledge, without systematic experimentation.
4. Routine activities that NEVER qualify:
   - Adopting existing cloud infrastructure (AWS, GCP, Azure)
   - Standard API integrations
   - UI/UX development
   - Bug fixing
   - Adapting known algorithms to a new context without genuine uncertainty
5. You MUST reason step-by-step BEFORE scoring (Chain-of-Thought).

SCORING SCALE:
- 0.0–0.2: Clearly routine / commercial
- 0.3–0.4: Marginal — some interesting work but not R&D
- 0.5–0.6: Borderline eligible — proceed with caution and strong documentation
- 0.7–0.8: Solid R&D — clear uncertainty and systematic approach
- 0.9–1.0: Exceptional R&D — fundamental research or groundbreaking innovation

WEIGHTS: novelty=30%, technical_uncertainty=30%, systematic_approach=15%, transferability=10%, creative_element=15%

Output ONLY valid JSON. NO markdown. NO text before or after the JSON object.`;

const CLASSIFY_USER = (description: string, country: string, salary: number, dev: number): string => {
  const rules = getTaxRules(country);
  return `Analyze the following project for R&D qualification under ${rules.programName} rules.

PROJECT DESCRIPTION:
"${description}"

FINANCIAL CONTEXT:
- Claimed salary/staff costs: ${salary.toLocaleString("en-GB", { style: "currency", currency: rules.currency })}
- Claimed development/contractor costs: ${dev.toLocaleString("en-GB", { style: "currency", currency: rules.currency })}
- Country jurisdiction: ${rules.countryName}

JURISDICTION-SPECIFIC NOTE:
${rules.notes}

Respond with EXACTLY this JSON structure (no markdown, no text outside JSON):
{
  "step_by_step_analysis": {
    "1_identify_baseline": "<What is the established industry baseline/state-of-the-art for this type of work?>",
    "2_identify_advance": "<What specific technical advance beyond that baseline is claimed? Be precise.>",
    "3_identify_uncertainty": "<Why could a competent professional NOT achieve this outcome using existing published knowledge? What was genuinely unknown?>",
    "4_evaluate_methodology": "<Did they systematically experiment, test hypotheses, and iterate? Or was it straightforward implementation?>"
  },
  "rd_score": <float 0.0-1.0>,
  "is_rd_eligible": <boolean — true ONLY IF rd_score >= ${rules.minRdScoreThreshold} AND technical_uncertainty.score >= 0.5>,
  "criteria_scores": {
    "novelty": { "score": <float>, "justification": "<cite specific evidence from description>" },
    "technical_uncertainty": { "score": <float>, "justification": "<cite specific evidence from description>" },
    "systematic_approach": { "score": <float>, "justification": "<cite specific evidence from description>" },
    "transferability": { "score": <float>, "justification": "<cite specific evidence from description>" },
    "creative_element": { "score": <float>, "justification": "<cite specific evidence from description>" }
  },
  "key_innovations": ["<Concise description of each genuinely innovative technical aspect>"],
  "disqualifying_factors_found": ["<List any routine activities detected that DO NOT qualify — UI work, standard integrations, etc.>"],
  "risk_flags": ["<Areas a tax inspector would challenge>"],
  "recommended_evidence": ["<Specific documentation company must prepare to defend this claim>"]
}`;
};

// ─── Pass 2: Generate Claim Text ───────────────────────────────────────────

const GENERATE_SYSTEM = `You are a Senior R&D Tax Technical Writer at a Big 4 firm. You write audit-proof formal justification reports for submission to national tax authorities.

CRITICAL DIRECTIVES:
1. Write in dry, precise, third-person technical language. Zero marketing language.
2. Focus on TECHNOLOGICAL challenges and unknowns — not business outcomes.
3. Separate routine commercial work from core R&D activities.
4. Reference the OECD Frascati Manual definitions where appropriate.
5. Every claim must be backed by the specific activities described by the company.

Output ONLY valid JSON. NO markdown. NO text before or after the JSON object.`;

const GENERATE_USER = (
  description: string,
  country: string,
  classification: RdClassificationResult,
  salary: number,
  dev: number
): string => {
  const rules = getTaxRules(country);
  return `Generate an audit-proof R&D tax claim justification under ${rules.programName}.

COMPANY PROJECT DESCRIPTION:
"${description}"

AI CLASSIFICATION ANALYSIS (use this as your technical basis):
- R&D Score: ${classification.rd_score.toFixed(2)}
- Key Innovations: ${JSON.stringify(classification.key_innovations)}
- Technical Uncertainty Evidence: ${classification.criteria_scores.technical_uncertainty.justification}
- Technological Baseline: ${classification.step_by_step_analysis["1_identify_baseline"]}
- Technological Advance Identified: ${classification.step_by_step_analysis["2_identify_advance"]}
- Core Uncertainty: ${classification.step_by_step_analysis["3_identify_uncertainty"]}
- Methodology: ${classification.step_by_step_analysis["4_evaluate_methodology"]}
- Risk Flags to address: ${JSON.stringify(classification.risk_flags)}

EXPENDITURE SUMMARY:
- Staff/Salary costs: ${salary.toLocaleString("en-GB", { style: "currency", currency: rules.currency })}
- Contractor/Development costs: ${dev.toLocaleString("en-GB", { style: "currency", currency: rules.currency })}

JURISDICTION: ${rules.countryName} — ${rules.programName}
${rules.notes}

Respond with EXACTLY this JSON:
{
  "claim_text": {
    "company_overview": "<1-2 paragraphs: company technical context and R&D activities>",
    "project_descriptions": [
      {
        "project_title": "<Technical project name>",
        "technological_baseline": "<State of the art before this project>",
        "objectives": "<Purely technical objectives — not commercial>",
        "technical_challenges": "<Specific engineering/scientific hurdles>",
        "methodology_and_iterations": "<Systematic approach: what was tested, what failed, what was learned>",
        "outcomes": "<Technical results — successes, failures, or partial advances>"
      }
    ],
    "technological_advancement_statement": "<2-3 paragraphs: how does this work advance the state of the art?>",
    "technological_uncertainty_statement": "<2-3 paragraphs: what was genuinely unknown, and why could competent professionals not solve it routinely?>",
    "expenditure_justification": "<Paragraph linking R&D activities to specific cost categories>"
  },
  "metadata": {
    "total_projects_analyzed": 1,
    "qualifying_projects_count": ${classification.is_rd_eligible ? 1 : 0},
    "confidence_level": "${classification.rd_score >= 0.7 ? "high" : classification.rd_score >= 0.5 ? "medium" : "low"}",
    "audit_risk_warnings": ${JSON.stringify(classification.risk_flags)}
  }
}`;
};

// ─── Pipeline Orchestrator ─────────────────────────────────────────────────

export interface PipelineInput {
  description: string;
  salaryCosts: number;
  devCosts: number;
  countryCode: string;
  workspaceId?: string;
}

export interface PipelineResult {
  classification: RdClassificationResult;
  claimText: ClaimGenerationResult;
  latencyMs: number;
}

/**
 * Run the full two-pass LLM pipeline.
 *
 * Pass 1 (Classify): Low temperature (0.05) for consistent, rigorous scoring.
 * Pass 2 (Generate): Slightly higher temperature (0.3) for natural language variety.
 */
export async function runRdPipeline(input: PipelineInput): Promise<PipelineResult> {
  const start = Date.now();
  const { description, salaryCosts, devCosts, countryCode, workspaceId } = input;

  // ── Build dynamic few-shot context (static examples + user feedback) ──────
  const fewShotContext = await buildDynamicFewShotContext(workspaceId);

  // ── Pass 1: Classify ───────────────────────────────────────────────────

  let classification: RdClassificationResult;
  try {
    classification = await callLlm<RdClassificationResult>(
      [
        { role: "system", content: CLASSIFY_SYSTEM },
        { role: "user", content: fewShotContext + CLASSIFY_USER(description, countryCode, salaryCosts, devCosts) },
      ],
      { temperature: 0.05, max_tokens: 2500 }
    );
  } catch (err) {
    const msg = err instanceof LlmApiError ? err.message : String(err);
    throw new Error(`R&D classification failed: ${msg}`);
  }

  // Validate critical fields — prevent hallucinated scores
  classification.rd_score = clampScore(classification.rd_score);
  for (const key of Object.keys(classification.criteria_scores) as Array<
    keyof typeof classification.criteria_scores
  >) {
    classification.criteria_scores[key].score = clampScore(
      classification.criteria_scores[key].score
    );
  }

  // Enforce eligibility gate: technical_uncertainty MUST be >= 0.5
  const rules = getTaxRules(countryCode);
  if (
    classification.rd_score < rules.minRdScoreThreshold ||
    classification.criteria_scores.technical_uncertainty.score < 0.5
  ) {
    classification.is_rd_eligible = false;
  }

  // ── Pass 2: Generate Claim Text ────────────────────────────────────────

  let claimText: ClaimGenerationResult;
  try {
    claimText = await callLlm<ClaimGenerationResult>(
      [
        { role: "system", content: GENERATE_SYSTEM },
        {
          role: "user",
          content: GENERATE_USER(description, countryCode, classification, salaryCosts, devCosts),
        },
      ],
      { temperature: 0.3, max_tokens: 4000 }
    );
  } catch (err) {
    const msg = err instanceof LlmApiError ? err.message : String(err);
    throw new Error(`Claim generation failed: ${msg}`);
  }

  return {
    classification,
    claimText,
    latencyMs: Date.now() - start,
  };
}

/** Clamp a score to [0.0, 1.0] and round to 2 decimal places */
function clampScore(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(n)) return 0;
  return Math.round(Math.min(1.0, Math.max(0.0, n)) * 100) / 100;
}
