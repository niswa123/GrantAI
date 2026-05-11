/**
 * R&D Tax Engine — Core Types
 * Shared interfaces for the entire scoring + calculation + generation pipeline.
 */

// ─── LLM Scoring Result ────────────────────────────────────────────────────

export interface CriterionScore {
  score: number; // 0.0 – 1.0
  justification: string;
}

export interface StepByStepAnalysis {
  "1_identify_baseline": string;
  "2_identify_advance": string;
  "3_identify_uncertainty": string;
  "4_evaluate_methodology": string;
}

export interface RdClassificationResult {
  /** LLM chain-of-thought before scoring */
  step_by_step_analysis: StepByStepAnalysis;
  /** Weighted composite score 0.0 – 1.0 */
  rd_score: number;
  /** True only if rd_score >= threshold AND technical_uncertainty >= 0.5 */
  is_rd_eligible: boolean;
  criteria_scores: {
    novelty: CriterionScore;
    technical_uncertainty: CriterionScore;
    systematic_approach: CriterionScore;
    transferability: CriterionScore;
    creative_element: CriterionScore;
  };
  key_innovations: string[];
  disqualifying_factors_found: string[];
  risk_flags: string[];
  recommended_evidence: string[];
}

// ─── Credit Calculation Result ─────────────────────────────────────────────

export interface CreditCalculationResult {
  /** Country-specific program applied */
  program: string;
  /** Credit rate applied (first tier or base) */
  appliedRate: number;
  /** Total qualifying expenditure after eligibility caps */
  qualifyingExpenditure: number;
  /** Final credit amount */
  creditAmount: number;
  /** Line-by-line expense breakdown */
  breakdown: ExpenseLineItem[];
  /** Whether tiered rates were applied */
  tieredBreakdown: TierLineItem[] | null;
  /** Whether SME rate was available */
  smeApplied: boolean;
}

export interface ExpenseLineItem {
  category: "salary" | "contractor" | "materials" | "software" | "overhead";
  grossAmount: number;
  eligiblePercentage: number;
  qualifyingAmount: number;
}

export interface TierLineItem {
  tier: string;
  amount: number;
  rate: number;
  credit: number;
}

// ─── Claim Generation Result ───────────────────────────────────────────────

export interface ProjectDescription {
  project_title: string;
  technological_baseline: string;
  objectives: string;
  technical_challenges: string;
  methodology_and_iterations: string;
  outcomes: string;
}

export interface ClaimGenerationResult {
  claim_text: {
    company_overview: string;
    project_descriptions: ProjectDescription[];
    technological_advancement_statement: string;
    technological_uncertainty_statement: string;
    expenditure_justification: string;
  };
  metadata: {
    total_projects_analyzed: number;
    qualifying_projects_count: number;
    confidence_level: "high" | "medium" | "low";
    audit_risk_warnings: string[];
  };
}

// ─── Final Engine Output ───────────────────────────────────────────────────

export interface RdEngineOutput {
  /** Validated R&D classification from LLM */
  classification: RdClassificationResult;
  /** Deterministic credit calculation from tax rules */
  credit: CreditCalculationResult;
  /** LLM-generated formal claim text */
  claimText: ClaimGenerationResult;
  /** ISO timestamp */
  processedAt: string;
  /** LLM model used */
  model: string;
  /** Total pipeline latency in ms */
  latencyMs: number;
}
