/**
 * Credit Calculator — Deterministic Tax Credit Computation
 *
 * This module is PURELY MATHEMATICAL. It takes validated inputs and applies
 * the legal tax rules from the registry. Zero LLM involvement here.
 * This ensures the numbers are always reproducible and auditable.
 */

import { getTaxRules } from "@/lib/rd-engine/legal_rules/tax-rules.registry";
import type {
  CreditCalculationResult,
  ExpenseLineItem,
  TierLineItem,
} from "./types";

export interface ExpenseInput {
  salary: number;
  contractor: number;
  materials: number;
  software: number;
  overhead?: number; // auto-computed for some countries (e.g. France forfait)
}

/**
 * Compute the legally-correct R&D tax credit for a given country and expense set.
 *
 * Steps:
 *  1. Load tax rule for country
 *  2. Apply per-category eligibility caps (percentage of expense that qualifies)
 *  3. Apply hard amount caps per category where applicable (e.g. Germany €2M cap)
 *  4. Apply overhead forfait if the country mandates it (e.g. France 43% of salary)
 *  5. Sum total qualifying expenditure (capped at maxAnnualClaim if applicable)
 *  6. Apply tiered credit rates if present, flat rate otherwise
 *  7. Return fully-auditable breakdown
 */
export function computeCredit(
  countryCode: string,
  expenses: ExpenseInput,
  isSme: boolean = false
): CreditCalculationResult {
  const rules = getTaxRules(countryCode);

  // ── Step 1: Build line items ──────────────────────────────────────────────

  const categoryKeys = [
    "salary",
    "contractor",
    "materials",
    "software",
    "overhead",
  ] as const;

  const rawExpenses: Record<string, number> = {
    salary: expenses.salary,
    contractor: expenses.contractor,
    materials: expenses.materials,
    software: expenses.software,
    // France CIR: Overhead is auto-computed as 43% of salary (forfait method)
    overhead:
      expenses.overhead ??
      (rules.expenseCaps.overhead.eligiblePercentage > 0
        ? expenses.salary * rules.expenseCaps.overhead.eligiblePercentage
        : 0),
  };

  const lineItems: ExpenseLineItem[] = [];

  for (const cat of categoryKeys) {
    const cap = rules.expenseCaps[cat];
    const gross = rawExpenses[cat] ?? 0;

    if (
      gross <= 0 ||
      !rules.eligibleExpenseTypes.includes(cat) ||
      cap.eligiblePercentage === 0
    ) {
      continue;
    }

    let qualifying = gross * cap.eligiblePercentage;

    // Apply hard amount cap per category (e.g. Germany: salary capped at €2M)
    if (cap.maxAmount !== null) {
      qualifying = Math.min(qualifying, cap.maxAmount);
    }

    lineItems.push({
      category: cat as ExpenseLineItem["category"],
      grossAmount: gross,
      eligiblePercentage: cap.eligiblePercentage,
      qualifyingAmount: qualifying,
    });
  }

  // ── Step 2: Sum qualifying expenditure ───────────────────────────────────

  let totalQualifying = lineItems.reduce(
    (sum, item) => sum + item.qualifyingAmount,
    0
  );

  // Apply annual claim cap before credit calculation (e.g. Germany €1M/year)
  if (rules.maxAnnualClaim !== null) {
    totalQualifying = Math.min(totalQualifying, rules.maxAnnualClaim / (isSme && rules.smeEnhancedRate ? rules.smeEnhancedRate : rules.baseCreditRate));
  }

  // ── Step 3: Apply credit rate (tiered or flat) ────────────────────────────

  // Determine which rate to use
  const effectiveRate =
    isSme && rules.smeEnhancedRate
      ? rules.smeEnhancedRate
      : rules.baseCreditRate;

  let creditAmount = 0;
  let tieredBreakdown: TierLineItem[] | null = null;

  if (rules.tieredRates && !isSme) {
    // Apply tiered rates (e.g. France: 30% on first €100M, 5% above)
    tieredBreakdown = [];
    let remaining = totalQualifying;
    let previousUpTo = 0;

    for (const tier of rules.tieredRates) {
      if (remaining <= 0) break;

      const tierMax = tier.upTo !== null ? tier.upTo - previousUpTo : Infinity;
      const tierAmount = Math.min(remaining, tierMax);
      const tierCredit = tierAmount * tier.rate;

      tieredBreakdown.push({
        tier:
          tier.upTo !== null
            ? `Up to ${formatCurrency(tier.upTo, rules.currency)}`
            : `Above ${formatCurrency(previousUpTo, rules.currency)}`,
        amount: tierAmount,
        rate: tier.rate,
        credit: tierCredit,
      });

      creditAmount += tierCredit;
      remaining -= tierAmount;
      if (tier.upTo !== null) previousUpTo = tier.upTo;
    }
  } else {
    // Flat rate
    creditAmount = totalQualifying * effectiveRate;
    tieredBreakdown = null;
  }

  // Apply annual credit cap if applicable
  if (rules.maxAnnualClaim !== null) {
    creditAmount = Math.min(creditAmount, rules.maxAnnualClaim);
  }

  return {
    program: rules.programName,
    appliedRate: effectiveRate,
    qualifyingExpenditure: totalQualifying,
    creditAmount: Math.round(creditAmount * 100) / 100, // Round to cents
    breakdown: lineItems,
    tieredBreakdown,
    smeApplied: isSme && !!rules.smeEnhancedRate,
  };
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
