/**
 * LLM Classifier — Strict R&D classification of daily work logs.
 *
 * Architecture:
 * - Calls OpenAI-compatible API using OPENAI_API_KEY from environment.
 * - If OPENAI_API_KEY is missing, throws a hard error. No silent fallbacks in production.
 *
 * The system prompt is specifically designed for the "Daily R&D Value Flow" use case:
 * classify whether an engineer's daily work log describes R&D activity.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CriteriaScore {
  score: number;
  justification: string;
}

export interface LlmClassificationResult {
  classification: 'R&D' | 'Not R&D';
  explanation: string;
  confidenceScore: number;
  criteriaScores: {
    novelty: CriteriaScore;
    technicalUncertainty: CriteriaScore;
    systematicApproach: CriteriaScore;
    creativeElement: CriteriaScore;
  };
  model: string;
}

// ─── System Prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert R&D tax credit analyst with deep knowledge of the OECD Frascati Manual and international R&D tax incentive schemes (WBSO, CIR, UK RDEC/SME).

Your task: Given a DAILY WORK LOG written by an engineer or team lead, determine whether the described work qualifies as Research & Development (R&D) activity.

## CLASSIFICATION CRITERIA (Frascati Manual)

Evaluate each criterion on a scale of 0.0–1.0:

1. **Novelty** — Does the work create new knowledge, methods, algorithms, or solutions that didn't exist before? Is the team working beyond the current state of the art?
2. **Technical Uncertainty** — Are there genuine technical challenges that cannot be resolved by a competent professional using existing, commonly available knowledge? Does the outcome remain uncertain?
3. **Systematic Approach** — Is the work methodical, planned, and documented? Does it follow a hypothesis-test-iterate cycle?
4. **Creative Element** — Does the work involve non-routine problem-solving, creative engineering, or original design decisions?

## CLASSIFICATION RULES

- **R&D**: If the WEIGHTED AVERAGE of criteria scores >= 0.40 (weights: novelty=0.35, technical_uncertainty=0.35, systematic_approach=0.15, creative_element=0.15)
- **Not R&D**: Routine development, maintenance, bug fixes (without technical uncertainty), configuration, deployment, meetings, admin work, standard CRUD operations, using well-known libraries/frameworks in standard ways.

## CRITICAL RULES

- Be STRICT. Not every coding task is R&D. Standard feature development using known patterns is NOT R&D.
- Be FAIR. Genuine innovation, algorithm research, architectural breakthroughs, novel integrations ARE R&D.
- The confidence_score reflects YOUR confidence in the classification (0.0 = pure guess, 1.0 = absolutely certain).
- Always provide a clear, concise explanation (2-3 sentences) in plain English.

## CALIBRATION EXAMPLES

R&D (score 0.87): "Developed novel real-time anomaly detection for IoT sensors. Existing solutions (Isolation Forest, LSTM) failed due to concept drift. Designed hybrid architecture with custom attention mechanism, 200+ experimental runs." → QUALIFIES: genuine uncertainty, systematic experimentation, novel architecture.

NOT R&D (score 0.08): "Migrated backend from REST to GraphQL using Apollo Server. Fixed N+1 queries. Deployed to AWS via CI/CD." → DOES NOT QUALIFY: standard migration using documented tools, no technical uncertainty.

NOT R&D (score 0.05): "Integrated Stripe payment processing. Implemented webhooks, subscription billing, checkout UI." → DOES NOT QUALIFY: standard API integration with comprehensive vendor documentation.

BORDERLINE NOT R&D (score 0.28): "Implemented recommendation engine using collaborative filtering with Surprise library. Tuned hyperparameters via grid search." → DOES NOT QUALIFY: well-established technique, existing library, standard hyperparameter tuning.

R&D (score 0.72): "Built custom GNN for protein-ligand binding. Existing architectures (SchNet, DimeNet) showed systematic errors on our dataset. Designed novel equivariant layer." → QUALIFIES: existing tools explicitly failed, novel layer design, genuine uncertainty.

## OUTPUT FORMAT

You MUST respond with ONLY valid JSON. No markdown, no code blocks, no extra text.

{
  "classification": "R&D" or "Not R&D",
  "explanation": "2-3 sentence explanation of why this is/isn't R&D",
  "confidence_score": 0.0-1.0,
  "criteria_scores": {
    "novelty": { "score": 0.0-1.0, "justification": "brief reason" },
    "technical_uncertainty": { "score": 0.0-1.0, "justification": "brief reason" },
    "systematic_approach": { "score": 0.0-1.0, "justification": "brief reason" },
    "creative_element": { "score": 0.0-1.0, "justification": "brief reason" }
  }
}`;

const USER_PROMPT_TEMPLATE = `Analyze the following daily work log for R&D qualification:

---
{work_log}
---

Classify this work. Respond with JSON only.`;

// ─── LLM API Call ───────────────────────────────────────────────────────────

interface OpenAIResponse {
  choices: Array<{ message: { content: string } }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  model: string;
}

async function callLlmApi(workLogText: string): Promise<LlmClassificationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error(
      '[LLM] OPENAI_API_KEY is not set. ' +
      'Add OPENAI_API_KEY to your environment variables before using the R&D classifier.'
    );
  }

  const userMessage = USER_PROMPT_TEMPLATE.replace('{work_log}', workLogText);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`LLM API error ${response.status}: ${errorBody}`);
  }

  const result: OpenAIResponse = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from LLM');

  const parsed = JSON.parse(content);

  // Validate and normalize
  const classification = parsed.classification === 'R&D' ? 'R&D' : 'Not R&D';
  const confidenceScore = clamp(parsed.confidence_score ?? 0.5, 0, 1);

  return {
    classification,
    explanation: parsed.explanation || 'No explanation provided.',
    confidenceScore,
    criteriaScores: {
      novelty: normalizeScore(parsed.criteria_scores?.novelty),
      technicalUncertainty: normalizeScore(parsed.criteria_scores?.technical_uncertainty),
      systematicApproach: normalizeScore(parsed.criteria_scores?.systematic_approach),
      creativeElement: normalizeScore(parsed.criteria_scores?.creative_element),
    },
    model: result.model || model,
  };
}

// ─── Utilities ──────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeScore(raw: { score?: number; justification?: string } | undefined): CriteriaScore {
  return {
    score: clamp(raw?.score ?? 0, 0, 1),
    justification: raw?.justification || 'No justification provided.',
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function classifyWorkLog(text: string): Promise<LlmClassificationResult> {
  return callLlmApi(text);
}
