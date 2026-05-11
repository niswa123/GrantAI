/**
 * R&D Tax Credit Calculation Engine.
 *
 * Pure functions — no side effects, no DB calls.
 * Every calculation step is logged to an audit trail for debugging/compliance.
 * All coefficients come from CountryTaxRule — zero hardcoded values.
 */

import {
  type CountryTaxRule,
  type TierRule,
  getTaxRules,
} from './tax-rules.registry';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ExpenseInput {
  id: string;
  type: string;
  amount: number;
  isRdRelated: boolean;
  description?: string;
}

export interface ProjectInput {
  id: string;
  title: string;
  rdScore: number;
  isRd: boolean;
}

export interface CalculationInput {
  countryCode: string;
  companyRevenue?: number;
  projects: ProjectInput[];
  expenses: ExpenseInput[];
}

export interface ExpenseBreakdownItem {
  expenseId: string;
  type: string;
  originalAmount: number;
  cappedAmount: number;
  eligiblePercentage: number;
  qualifyingAmount: number;
  reason: string;
}

export interface AuditStep {
  step: string;
  detail: string;
  value?: number | string;
}

export interface SanityWarning {
  code: string;
  message: string;
  /** Severity: 'warn' = flag for review, 'critical' = likely data error */
  severity: 'warn' | 'critical';
}

export interface CalculationResult {
  rdExpensesTotal: number;
  nonRdExpensesTotal: number;
  estimatedCreditAmount: number;
  companyRdScore: number;
  qualifyingProjectsCount: number;
  expenseBreakdown: ExpenseBreakdownItem[];
  countryCode: string;
  effectiveCreditRate: number;
  smeRateApplied: boolean;
  auditTrail: AuditStep[];
  /** Business-logic sanity warnings — non-fatal flags for human review */
  sanityWarnings: SanityWarning[];
}

// ─── Core Calculation ───────────────────────────────────────────────────────

/**
 * Calculate the R&D tax credit for a company.
 */
export function calculateTaxCredit(input: CalculationInput): CalculationResult {
  const rules = getTaxRules(input.countryCode);
  const audit: AuditStep[] = [];

  audit.push({
    step: 'INIT',
    detail: `Using tax rules for ${rules.countryName} (${rules.programName})`,
    value: rules.countryCode,
  });

  // Step 1: Filter qualifying projects
  const qualifyingProjects = input.projects.filter(
    (p) => p.isRd && p.rdScore >= rules.minRdScoreThreshold,
  );

  audit.push({
    step: 'FILTER_PROJECTS',
    detail: `${qualifyingProjects.length} of ${input.projects.length} projects qualify (minScore: ${rules.minRdScoreThreshold})`,
    value: qualifyingProjects.length,
  });

  // Step 2: Calculate company-wide R&D score
  const companyRdScore = calculateCompanyRdScore(qualifyingProjects);

  audit.push({
    step: 'COMPANY_RD_SCORE',
    detail: `Weighted average R&D score across qualifying projects`,
    value: roundTo(companyRdScore, 4),
  });

  // Step 3: Process expenses through country rules
  const { breakdown, rdTotal, nonRdTotal } = processExpenses(
    input.expenses,
    rules,
    audit,
  );

  // Step 4: Determine credit rate (SME check + tiers)
  const { rate, isSme } = determineEffectiveCreditRate(
    rules,
    rdTotal,
    input.companyRevenue,
    audit,
  );

  // Step 5: Calculate final credit amount
  let estimatedCredit: number;

  if (rules.tieredRates && rules.tieredRates.length > 0) {
    estimatedCredit = calculateTieredCredit(rdTotal, rules.tieredRates, audit);
  } else {
    estimatedCredit = roundTo(rdTotal * rate, 2);
    audit.push({
      step: 'FLAT_CREDIT',
      detail: `${rdTotal} × ${rate} = ${estimatedCredit}`,
      value: estimatedCredit,
    });
  }

  // Step 6: Apply annual cap if exists
  if (rules.maxAnnualClaim !== null && estimatedCredit > rules.maxAnnualClaim) {
    audit.push({
      step: 'CAP_APPLIED',
      detail: `Credit ${estimatedCredit} exceeds annual cap ${rules.maxAnnualClaim}`,
      value: rules.maxAnnualClaim,
    });
    estimatedCredit = rules.maxAnnualClaim;
  }

  // Step 7: Sanity checks — business-logic validation
  const sanityWarnings = runSanityChecks({
    estimatedCredit,
    rdTotal,
    companyRevenue: input.companyRevenue,
    qualifyingProjectsCount: qualifyingProjects.length,
    totalExpenses: input.expenses.reduce((s, e) => s + e.amount, 0),
    audit,
  });

  audit.push({
    step: 'FINAL',
    detail: `Estimated R&D tax credit`,
    value: estimatedCredit,
  });

  return {
    rdExpensesTotal: roundTo(rdTotal, 2),
    nonRdExpensesTotal: roundTo(nonRdTotal, 2),
    estimatedCreditAmount: roundTo(estimatedCredit, 2),
    companyRdScore: roundTo(companyRdScore, 4),
    qualifyingProjectsCount: qualifyingProjects.length,
    expenseBreakdown: breakdown,
    countryCode: rules.countryCode,
    effectiveCreditRate: rate,
    smeRateApplied: isSme,
    auditTrail: audit,
    sanityWarnings,
  };
}

// ─── Internal Helpers ──────────────────────────────────────────────────────

function calculateCompanyRdScore(projects: ProjectInput[]): number {
  if (projects.length === 0) return 0;
  const total = projects.reduce((sum, p) => sum + p.rdScore, 0);
  return total / projects.length;
}

function processExpenses(
  expenses: ExpenseInput[],
  rules: CountryTaxRule,
  audit: AuditStep[],
): { breakdown: ExpenseBreakdownItem[]; rdTotal: number; nonRdTotal: number } {
  const breakdown: ExpenseBreakdownItem[] = [];
  let rdTotal = 0;
  let nonRdTotal = 0;

  for (const expense of expenses) {
    const typeNorm = expense.type.toLowerCase().trim();

    if (!rules.eligibleExpenseTypes.includes(typeNorm)) {
      breakdown.push({
        expenseId: expense.id,
        type: typeNorm,
        originalAmount: expense.amount,
        cappedAmount: 0,
        eligiblePercentage: 0,
        qualifyingAmount: 0,
        reason: `Type '${typeNorm}' not eligible in ${rules.countryCode}`,
      });
      nonRdTotal += expense.amount;
      continue;
    }

    if (!expense.isRdRelated) {
      breakdown.push({
        expenseId: expense.id,
        type: typeNorm,
        originalAmount: expense.amount,
        cappedAmount: 0,
        eligiblePercentage: 0,
        qualifyingAmount: 0,
        reason: 'Not flagged as R&D-related',
      });
      nonRdTotal += expense.amount;
      continue;
    }

    const capKey = typeNorm as keyof typeof rules.expenseCaps;
    const cap = rules.expenseCaps[capKey];

    if (!cap) {
      nonRdTotal += expense.amount;
      breakdown.push({
        expenseId: expense.id,
        type: typeNorm,
        originalAmount: expense.amount,
        cappedAmount: 0,
        eligiblePercentage: 0,
        qualifyingAmount: 0,
        reason: `No cap config for type '${typeNorm}'`,
      });
      continue;
    }

    const cappedAmount =
      cap.maxAmount !== null
        ? Math.min(expense.amount, cap.maxAmount)
        : expense.amount;

    const qualifyingAmount = roundTo(cappedAmount * cap.eligiblePercentage, 2);

    breakdown.push({
      expenseId: expense.id,
      type: typeNorm,
      originalAmount: expense.amount,
      cappedAmount,
      eligiblePercentage: cap.eligiblePercentage,
      qualifyingAmount,
      reason:
        qualifyingAmount > 0
          ? `Eligible: ${cap.eligiblePercentage * 100}% of ${cappedAmount}`
          : `Zero eligible percentage`,
    });

    rdTotal += qualifyingAmount;
  }

  audit.push({
    step: 'EXPENSE_PROCESSING',
    detail: `Processed ${expenses.length} expenses: R&D=${roundTo(rdTotal, 2)}, Non-R&D=${roundTo(nonRdTotal, 2)}`,
    value: roundTo(rdTotal, 2),
  });

  return { breakdown, rdTotal: roundTo(rdTotal, 2), nonRdTotal: roundTo(nonRdTotal, 2) };
}

function determineEffectiveCreditRate(
  rules: CountryTaxRule,
  _rdTotal: number,
  companyRevenue: number | undefined,
  audit: AuditStep[],
): { rate: number; isSme: boolean } {
  let isSme = false;
  let rate = rules.baseCreditRate;

  if (
    rules.smeEnhancedRate !== null &&
    rules.smeRevenueThreshold !== null &&
    companyRevenue !== undefined &&
    companyRevenue < rules.smeRevenueThreshold
  ) {
    isSme = true;
    rate = rules.smeEnhancedRate;
    audit.push({
      step: 'SME_RATE',
      detail: `Revenue ${companyRevenue} < ${rules.smeRevenueThreshold}. SME rate=${rate}`,
      value: rate,
    });
  } else {
    audit.push({
      step: 'STANDARD_RATE',
      detail: `Using base credit rate ${rate}`,
      value: rate,
    });
  }

  return { rate, isSme };
}

function calculateTieredCredit(
  totalQualifying: number,
  tiers: TierRule[],
  audit: AuditStep[],
): number {
  let remaining = totalQualifying;
  let totalCredit = 0;
  let previousBound = 0;

  for (const tier of tiers) {
    if (remaining <= 0) break;

    const tierSize =
      tier.upTo !== null ? tier.upTo - previousBound : remaining;
    const amountInTier = Math.min(remaining, tierSize);
    const tierCredit = roundTo(amountInTier * tier.rate, 2);

    audit.push({
      step: 'TIER_CREDIT',
      detail: `Tier [${previousBound}–${tier.upTo ?? '∞'}]: ${amountInTier} × ${tier.rate} = ${tierCredit}`,
      value: tierCredit,
    });

    totalCredit += tierCredit;
    remaining -= amountInTier;
    previousBound = tier.upTo ?? previousBound;
  }

  return roundTo(totalCredit, 2);
}

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ─── Sanity Check Layer ────────────────────────────────────────────────────

interface SanityCheckInput {
  estimatedCredit: number;
  rdTotal: number;
  companyRevenue: number | undefined;
  qualifyingProjectsCount: number;
  totalExpenses: number;
  audit: AuditStep[];
}

/**
 * Run business-logic sanity checks on the calculated result.
 * Returns warnings — does NOT throw. Final decision is for a human reviewer.
 *
 * Rules:
 * 1. CREDIT_EXCEEDS_REVENUE   — credit > company revenue (data error or fraudulent input)
 * 2. CREDIT_EXCEEDS_EXPENSES   — credit > total R&D expenses (impossible: rate can never exceed 100%)
 * 3. HIGH_EXPENSE_RATIO        — R&D expenses > 80% of revenue (unusual, warrants review)
 * 4. NO_QUALIFYING_PROJECTS    — calculation ran with zero qualifying projects
 */
function runSanityChecks(params: SanityCheckInput): SanityWarning[] {
  const warnings: SanityWarning[] = [];
  const { estimatedCredit, rdTotal, companyRevenue, qualifyingProjectsCount, totalExpenses, audit } = params;

  // Check 1: Credit cannot exceed total company revenue
  if (companyRevenue !== undefined && companyRevenue > 0 && estimatedCredit > companyRevenue) {
    const warning: SanityWarning = {
      code: 'CREDIT_EXCEEDS_REVENUE',
      message: `Estimated credit (${estimatedCredit}) exceeds company revenue (${companyRevenue}). This is likely a data entry error.`,
      severity: 'critical',
    };
    warnings.push(warning);
    audit.push({
      step: 'SANITY_FAIL',
      detail: warning.message,
      value: 'CREDIT_EXCEEDS_REVENUE',
    });
  }

  // Check 2: Credit cannot exceed total qualifying expenses (mathematical impossibility)
  if (rdTotal > 0 && estimatedCredit > rdTotal) {
    const warning: SanityWarning = {
      code: 'CREDIT_EXCEEDS_EXPENSES',
      message: `Estimated credit (${estimatedCredit}) exceeds total qualifying expenses (${rdTotal}). Effective rate > 100% is impossible.`,
      severity: 'critical',
    };
    warnings.push(warning);
    audit.push({
      step: 'SANITY_FAIL',
      detail: warning.message,
      value: 'CREDIT_EXCEEDS_EXPENSES',
    });
  }

  // Check 3: R&D expenses > 80% of revenue is unusual (possible but worth flagging)
  if (companyRevenue !== undefined && companyRevenue > 0) {
    const rdRevenueRatio = rdTotal / companyRevenue;
    if (rdRevenueRatio > 0.8) {
      const warning: SanityWarning = {
        code: 'HIGH_EXPENSE_RATIO',
        message: `R&D qualifying expenses represent ${roundTo(rdRevenueRatio * 100, 1)}% of revenue. Tax authorities may request additional substantiation.`,
        severity: 'warn',
      };
      warnings.push(warning);
      audit.push({
        step: 'SANITY_WARN',
        detail: warning.message,
        value: 'HIGH_EXPENSE_RATIO',
      });
    }
  }

  // Check 4: Zero qualifying projects — likely a classification failure
  if (qualifyingProjectsCount === 0 && totalExpenses > 0) {
    const warning: SanityWarning = {
      code: 'NO_QUALIFYING_PROJECTS',
      message: 'Zero qualifying R&D projects found. Run project classification before calculating credit.',
      severity: 'warn',
    };
    warnings.push(warning);
    audit.push({
      step: 'SANITY_WARN',
      detail: warning.message,
      value: 'NO_QUALIFYING_PROJECTS',
    });
  }

  if (warnings.length === 0) {
    audit.push({ step: 'SANITY_OK', detail: 'All sanity checks passed', value: 'OK' });
  }

  return warnings;
}
