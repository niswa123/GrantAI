/**
 * Event Analyzer — R&D classification for individual EngineeringEvent records.
 *
 * Takes an EngineeringEvent from the database, sends it through the LLM classifier,
 * and persists the result as an AnalyzedLog record.
 *
 * Uses the existing classifier from src/lib/llm/classifier.ts which requires
 * a real OpenAI API key.
 */

import prisma from "@/lib/prisma";
import { classifyWorkLog, type LlmClassificationResult } from "@/lib/llm/classifier";

// Default daily rate for value calculation — will come from company settings later
const DEFAULT_DAILY_RATE = 800;

/**
 * Derive a complexity weight from the LLM criteria scores.
 *
 * Formula: weighted average of criteria scores, scaled to [1.0, 3.0].
 * - 1.0 = routine complexity
 * - 2.0 = significant complexity
 * - 3.0 = exceptional complexity
 *
 * This multiplier is used in value calculations to weight higher-complexity
 * R&D work more heavily in the financial model.
 */
function deriveComplexityWeight(result: LlmClassificationResult): number {
  const { novelty, technicalUncertainty, systematicApproach, creativeElement } =
    result.criteriaScores;

  // Weighted average matching the classifier's own weights
  const weightedAvg =
    novelty.score * 0.35 +
    technicalUncertainty.score * 0.35 +
    systematicApproach.score * 0.15 +
    creativeElement.score * 0.15;

  // Scale from [0, 1] to [1.0, 3.0]
  const weight = 1.0 + weightedAvg * 2.0;

  return Math.round(weight * 100) / 100;
}

/**
 * Calculate the monetary R&D value for an analyzed event.
 *
 * Simple formula for MVP:
 *   value = dailyRate × complexityWeight × confidenceScore   (if R&D)
 *   value = 0                                                 (if not R&D)
 */
function calculateEventValue(
  isRd: boolean,
  confidenceScore: number,
  complexityWeight: number,
  dailyRate: number = DEFAULT_DAILY_RATE
): number {
  if (!isRd) return 0;
  return Math.round(dailyRate * complexityWeight * confidenceScore * 100) / 100;
}

export interface AnalyzeEventResult {
  analyzedLogId: string;
  isRd: boolean;
  confidenceScore: number;
  complexityWeight: number;
  justification: string;
  calculatedValue: number;
  model: string;
}

/**
 * Analyze a single EngineeringEvent for R&D qualification.
 *
 * 1. Loads the event from DB
 * 2. Builds a text prompt from its title + description
 * 3. Calls the LLM classifier
 * 4. Maps the result to AnalyzedLog fields
 * 5. Persists the AnalyzedLog record
 * 6. Updates the event status to "analyzed"
 *
 * Throws if the event doesn't exist or is already analyzed.
 */
export async function analyzeEngineeringEvent(
  eventId: string
): Promise<AnalyzeEventResult> {
  // 1. Load event
  const event = await prisma.engineeringEvent.findUnique({
    where: { id: eventId },
    include: { analyzed_log: true },
  });

  if (!event) {
    throw new Error(`EngineeringEvent not found: ${eventId}`);
  }

  if (event.analyzed_log) {
    throw new Error(`Event already analyzed: ${eventId}`);
  }

  // 2. Build text for the classifier
  const textForAnalysis = buildAnalysisText(event);

  // 3. Classify via LLM
  let llmResult: LlmClassificationResult;
  try {
    llmResult = await classifyWorkLog(textForAnalysis);
  } catch (err) {
    // Mark event as failed and re-throw
    await prisma.engineeringEvent.update({
      where: { id: eventId },
      data: { status: "failed" },
    });
    throw new Error(
      `LLM classification failed for event ${eventId}: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // 4. Map results
  const isRd = llmResult.classification === "R&D";
  const confidenceScore = llmResult.confidenceScore;
  const complexityWeight = deriveComplexityWeight(llmResult);
  const justification = llmResult.explanation;
  const calculatedValue = calculateEventValue(isRd, confidenceScore, complexityWeight);

  // 5. Persist AnalyzedLog + update event status in a transaction
  const analyzedLog = await prisma.$transaction(async (tx) => {
    const log = await tx.analyzedLog.create({
      data: {
        event_id: eventId,
        company_id: event.company_id,
        is_rd: isRd,
        confidence_score: confidenceScore,
        complexity_weight: complexityWeight,
        justification,
        calculated_value: calculatedValue,
        model_used: llmResult.model,
      },
    });

    await tx.engineeringEvent.update({
      where: { id: eventId },
      data: { status: "analyzed" },
    });

    return log;
  });

  return {
    analyzedLogId: analyzedLog.id,
    isRd,
    confidenceScore,
    complexityWeight,
    justification,
    calculatedValue,
    model: llmResult.model,
  };
}

/**
 * Build a text representation of an EngineeringEvent for LLM classification.
 * Combines title, description, and event type into a coherent work log description.
 */
function buildAnalysisText(event: {
  title: string;
  description: string | null;
  event_type: string;
  author_email: string | null;
}): string {
  const parts: string[] = [];

  // Add event type context
  const typeLabels: Record<string, string> = {
    commit: "Git Commit",
    ticket_closed: "Completed Ticket",
    pr_merged: "Merged Pull Request",
  };
  const typeLabel = typeLabels[event.event_type] || event.event_type;
  parts.push(`[${typeLabel}]`);

  // Title is always present
  parts.push(event.title);

  // Description adds detail
  if (event.description && event.description.trim().length > 0) {
    parts.push(event.description.trim());
  }

  return parts.join("\n\n");
}
