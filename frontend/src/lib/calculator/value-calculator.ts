/**
 * R&D Value Calculator — Converts LLM classification into monetary value (€).
 *
 * Formula:
 *   rdValue = isRd ? (teamDailyRate × confidenceScore × R&D_CREDIT_RATE) : 0
 *
 * Where:
 *   - teamDailyRate: the daily cost of the team/person (€)
 *   - confidenceScore: LLM's confidence in the R&D classification (0.0–1.0)
 *   - R&D_CREDIT_RATE: the applicable tax credit rate (default 0.30 = 30%, typical for EU/NL)
 *
 * This represents the *potential daily R&D tax credit value* of the described work.
 *
 * Example:
 *   Team daily rate: €800
 *   Confidence: 0.85
 *   Credit rate: 0.30
 *   → R&D Value = €800 × 0.85 × 0.30 = €204.00
 */

// ─── Configuration ──────────────────────────────────────────────────────────

/** Default R&D tax credit rate (30% — typical for NL WBSO / FR CIR first tranche) */
const DEFAULT_RD_CREDIT_RATE = 0.30;

/** Minimum confidence threshold — below this, we zero out the value */
const MIN_CONFIDENCE_THRESHOLD = 0.20;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ValueCalculationInput {
  /** Whether the LLM classified the work as R&D */
  isRd: boolean;
  /** LLM confidence score (0.0–1.0) */
  confidenceScore: number;
  /** Daily team/person rate in € */
  teamDailyRate: number;
  /** Override R&D credit rate (optional, default 0.30) */
  rdCreditRate?: number;
}

export interface ValueCalculationBreakdown {
  /** The final R&D value in € */
  rdValue: number;
  /** Components of the calculation */
  breakdown: {
    teamDailyRate: number;
    confidenceScore: number;
    rdCreditRate: number;
    isRd: boolean;
    /** Whether confidence was above the minimum threshold */
    aboveThreshold: boolean;
    /** The raw pre-rounding value */
    rawValue: number;
  };
}

// ─── Calculator ─────────────────────────────────────────────────────────────

/**
 * Calculate the R&D tax credit value for a single daily log entry.
 * Returns 0 if the work is not classified as R&D or confidence is below threshold.
 */
export function calculateRdValue(input: ValueCalculationInput): number {
  const { isRd, confidenceScore, teamDailyRate, rdCreditRate } = input;
  const rate = rdCreditRate ?? DEFAULT_RD_CREDIT_RATE;

  // Not R&D → no value
  if (!isRd) return 0;

  // Below confidence threshold → no value
  if (confidenceScore < MIN_CONFIDENCE_THRESHOLD) return 0;

  // Calculate: daily rate × confidence × credit rate
  const rawValue = teamDailyRate * confidenceScore * rate;

  // Round to 2 decimal places
  return Math.round(rawValue * 100) / 100;
}

/**
 * Calculate with full breakdown — useful for detailed UI display.
 */
export function calculateRdValueDetailed(input: ValueCalculationInput): ValueCalculationBreakdown {
  const { isRd, confidenceScore, teamDailyRate, rdCreditRate } = input;
  const rate = rdCreditRate ?? DEFAULT_RD_CREDIT_RATE;
  const aboveThreshold = confidenceScore >= MIN_CONFIDENCE_THRESHOLD;
  const rawValue = isRd && aboveThreshold ? teamDailyRate * confidenceScore * rate : 0;
  const rdValue = Math.round(rawValue * 100) / 100;

  return {
    rdValue,
    breakdown: {
      teamDailyRate,
      confidenceScore,
      rdCreditRate: rate,
      isRd,
      aboveThreshold,
      rawValue,
    },
  };
}

/**
 * Calculate cumulative R&D value from an array of log entries.
 */
export function calculateCumulativeValue(
  entries: Array<{ classification: string; confidenceScore: number; teamDailyRate: number }>,
): { totalValue: number; rdEntries: number; totalEntries: number; averageConfidence: number } {
  let totalValue = 0;
  let rdEntries = 0;
  let totalConfidence = 0;

  for (const entry of entries) {
    const isRd = entry.classification === 'R&D';
    const value = calculateRdValue({
      isRd,
      confidenceScore: entry.confidenceScore,
      teamDailyRate: entry.teamDailyRate,
    });

    totalValue += value;
    if (isRd) {
      rdEntries++;
      totalConfidence += entry.confidenceScore;
    }
  }

  return {
    totalValue: Math.round(totalValue * 100) / 100,
    rdEntries,
    totalEntries: entries.length,
    averageConfidence: rdEntries > 0 ? Math.round((totalConfidence / rdEntries) * 100) / 100 : 0,
  };
}
