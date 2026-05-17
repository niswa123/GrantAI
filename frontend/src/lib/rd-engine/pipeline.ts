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
import { getDomainKnowledge } from "./domain-knowledge";

// ─── Types ─────────────────────────────────────────────────────────────────

interface CritiqueResult {
  critique: string;
  agrees_with_classification: boolean;
  adjusted_rd_score: number;
}

// ─── Pass 1: Classify Project ──────────────────────────────────────────────

const CLASSIFY_SYSTEM = (rules: ReturnType<typeof getTaxRules>) => `You are a Senior Big 4 R&D Tax Credit Director with 20+ years of experience defending claims before HMRC, Belastingdienst, DGFiP, and Finanzamt.

Your sole purpose: rigorously evaluate whether a project meets the ${rules.legalFramework} definition of R&D.

CRITICAL DIRECTIVES — READ CAREFULLY:
1. Be a SKEPTIC. Not a cheerleader. If in doubt, mark lower.
2. BUSINESS NOVELTY ≠ TECHNOLOGICAL NOVELTY. Building a new app using existing frameworks is NOT R&D. Solving a genuinely unsolved technical problem IS.
3. ${rules.terminology.uncertainty.toUpperCase()} is the most important criterion. It must be GENUINE uncertainty that a competent engineer in the field could not resolve using existing published knowledge.
4. ZERO TOLERANCE FOR FALSE POSITIVES. The following activities are NEVER R&D and MUST receive a score < 0.2:
   - Changing UI/UX elements (button colors, layouts, styling)
   - Fixing syntax errors, typos, or simple bugs
   - Standard CRUD operations and API integrations
   - Upgrading dependencies or migrating frameworks
   - Adopting existing cloud infrastructure (AWS, GCP, Azure)
5. You MUST reason step-by-step BEFORE scoring (Chain-of-Thought).

${rules.legalFramework} CORE CRITERIA:
${rules.legalDefinitionPrompt}

SCORING SCALE:
- 0.0–0.2: Clearly routine / commercial / UI changes / simple fixes
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

// ─── Pass 1b: Critique (Devil's Advocate) ──────────────────────────────────

const CRITIQUE_SYSTEM = `You are an aggressive, skeptical Tax Authority Inspector (Devil's Advocate).
Your job is to read an R&D classification result and try to TEAR IT DOWN.
Look for any signs that the work is actually routine software engineering disguised as R&D.
If the classification is 'Not R&D', verify they didn't miss a genuine technological uncertainty.

Output ONLY valid JSON:
{
  "critique": "<2-3 sentences aggressively challenging the initial classification>",
  "agrees_with_classification": <boolean>,
  "adjusted_rd_score": <float 0.0-1.0 - lower it if you suspect routine work>
}`;

const CRITIQUE_USER = (description: string, initialResult: RdClassificationResult): string => {
  return `PROJECT DESCRIPTION:
"${description}"

INITIAL CLASSIFICATION (By junior analyst):
- Score: ${initialResult.rd_score}
- Eligible: ${initialResult.is_rd_eligible}
- Novelty Justification: ${initialResult.criteria_scores.novelty.justification}
- Uncertainty Justification: ${initialResult.criteria_scores.technical_uncertainty.justification}

Critique this classification. Are they too generous? Are they confusing complex business logic with genuine technological uncertainty?`;
};

// ─── Pass 2: Generate Claim Text ───────────────────────────────────────────

const GENERATE_SYSTEM = (rules: ReturnType<typeof getTaxRules>) => `You are a Senior R&D Tax Technical Writer at a Big 4 firm. You write audit-proof formal justification reports for submission to national tax authorities.

CRITICAL DIRECTIVES:
1. Write in dry, precise, third-person technical language. Zero marketing language.
2. Focus on TECHNOLOGICAL challenges and unknowns — not business outcomes.
3. Separate routine commercial work from core R&D activities.
4. Reference the ${rules.legalFramework} definitions where appropriate. Use terms like "${rules.terminology.advance}" and "${rules.terminology.uncertainty}".
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
    "technological_advancement_statement": "<2-3 paragraphs: how does this work achieve '${rules.terminology.advance}'?>",
    "technological_uncertainty_statement": "<2-3 paragraphs: what was the '${rules.terminology.uncertainty}', and why could competent professionals not solve it routinely?>",
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
 * Run the full two-pass LLM pipeline with Self-Consistency and Critique.
 */
export async function runRdPipeline(input: PipelineInput): Promise<PipelineResult> {
  const start = Date.now();
  const { description, salaryCosts, devCosts, countryCode, workspaceId } = input;

  // ── Build Context ──────────────────────────────────────────────────────
  const fewShotContext = await buildDynamicFewShotContext(workspaceId);
  const domainKnowledge = getDomainKnowledge(countryCode);
  const fullContext = domainKnowledge + "\n" + fewShotContext;

  // ── Pass 1: Classify (with Self-Consistency for borderline cases) ──────
  
  let classification = await runClassificationPass(description, countryCode, salaryCosts, devCosts, fullContext);

  // SELF-CONSISTENCY SAMPLING: If score is borderline (0.40 - 0.65), run 2 more times
  if (classification.rd_score >= 0.40 && classification.rd_score <= 0.65) {
    console.log(`[Pipeline] Borderline score (${classification.rd_score}). Triggering self-consistency sampling...`);
    const run2 = await runClassificationPass(description, countryCode, salaryCosts, devCosts, fullContext, 0.15);
    const run3 = await runClassificationPass(description, countryCode, salaryCosts, devCosts, fullContext, 0.25);
    
    // Median score
    const scores = [classification.rd_score, run2.rd_score, run3.rd_score].sort();
    const medianScore = scores[1];
    
    // Majority vote for eligibility
    const votes = [classification.is_rd_eligible, run2.is_rd_eligible, run3.is_rd_eligible];
    const eligibleCount = votes.filter(v => v).length;
    
    // Pick the run closest to the median score
    classification = [classification, run2, run3].reduce((prev, curr) => 
      Math.abs(curr.rd_score - medianScore) < Math.abs(prev.rd_score - medianScore) ? curr : prev
    );
    
    classification.is_rd_eligible = eligibleCount >= 2;
    console.log(`[Pipeline] Self-Consistency resolved: Median Score = ${medianScore}, Eligible = ${classification.is_rd_eligible}`);
  }

  // ── Pass 1b: Critique (Devil's Advocate) ───────────────────────────────
  
  if (classification.is_rd_eligible) {
    try {
      const critique = await callLlm<CritiqueResult>(
        [
          { role: "system", content: CRITIQUE_SYSTEM },
          { role: "user", content: CRITIQUE_USER(description, classification) },
        ],
        { temperature: 0.1, max_tokens: 1000 }
      );
      
      console.log(`[Pipeline] Critique pass applied. Agree: ${critique.agrees_with_classification}, Adjusted Score: ${critique.adjusted_rd_score}`);
      
      if (!critique.agrees_with_classification) {
        classification.rd_score = clampScore(critique.adjusted_rd_score);
        // Re-evaluate eligibility gate
        const rules = getTaxRules(countryCode);
        if (classification.rd_score < rules.minRdScoreThreshold) {
          classification.is_rd_eligible = false;
        }
      }
      
      // Inject critique into risk flags
      classification.risk_flags.push(`Devil's Advocate Critique: ${critique.critique}`);
      
    } catch (err) {
      console.warn(`[Pipeline] Critique pass failed, proceeding with initial classification: ${err}`);
    }
  }

  // ── Pass 2: Generate Claim Text ────────────────────────────────────────

  let claimText: ClaimGenerationResult;
  try {
    claimText = await callLlm<ClaimGenerationResult>(
      [
        { role: "system", content: GENERATE_SYSTEM(getTaxRules(countryCode)) },
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

/** Helper to run a single classification pass */
async function runClassificationPass(
  description: string, 
  countryCode: string, 
  salaryCosts: number, 
  devCosts: number, 
  fullContext: string,
  temperature: number = 0.05
): Promise<RdClassificationResult> {
  let classification: RdClassificationResult;
  try {
    classification = await callLlm<RdClassificationResult>(
      [
        { role: "system", content: CLASSIFY_SYSTEM(getTaxRules(countryCode)) },
        { role: "user", content: fullContext + "\n\n" + CLASSIFY_USER(description, countryCode, salaryCosts, devCosts) },
      ],
      { temperature, max_tokens: 2500 }
    );
  } catch (err) {
    const msg = err instanceof LlmApiError ? err.message : String(err);
    throw new Error(`R&D classification failed: ${msg}`);
  }

  // Validate critical fields
  classification.rd_score = clampScore(classification.rd_score);
  for (const key of Object.keys(classification.criteria_scores) as Array<keyof typeof classification.criteria_scores>) {
    classification.criteria_scores[key].score = clampScore(classification.criteria_scores[key].score);
  }

  // Enforce eligibility gate
  const rules = getTaxRules(countryCode);
  if (
    classification.rd_score < rules.minRdScoreThreshold ||
    classification.criteria_scores.technical_uncertainty.score < 0.5
  ) {
    classification.is_rd_eligible = false;
  }

  return classification;
}

/** Clamp a score to [0.0, 1.0] and round to 2 decimal places */
function clampScore(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(n)) return 0;
  return Math.round(Math.min(1.0, Math.max(0.0, n)) * 100) / 100;
}
