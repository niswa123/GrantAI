/**
 * Tax Rules Registry — Modular, country-specific R&D tax credit configurations.
 *
 * Each country profile defines:
 * - Credit rate (base percentage of qualifying expenditure)
 * - Expense caps per category
 * - Eligible expense types
 * - SME vs Large company distinctions
 * - Annual claim limits
 *
 * To add a new country: add a new entry to COUNTRY_TAX_RULES.
 * All monetary values are in the country's local currency unless noted.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ExpenseCap {
  /** Maximum amount per category (null = unlimited) */
  maxAmount: number | null;
  /** Percentage of expense eligible for credit calculation (0.0 - 1.0) */
  eligiblePercentage: number;
}

export interface TierRule {
  /** Upper bound of this tier (null = unlimited) */
  upTo: number | null;
  /** Credit rate for this tier (0.0 - 1.0) */
  rate: number;
}

export interface CountryTaxRule {
  /** ISO 3166-1 alpha-2 country code */
  countryCode: string;
  /** Human-readable country name */
  countryName: string;
  /** Official program name */
  programName: string;
  /** Currency ISO 4217 code */
  currency: string;

  /** Base credit rate applied to total qualifying expenditure (0.0 - 1.0) */
  baseCreditRate: number;

  /** Tiered credit rates (e.g., France: 30% on first €100M, 5% above) */
  tieredRates: TierRule[] | null;

  /** Per-category expense caps and eligibility */
  expenseCaps: {
    salary: ExpenseCap;
    contractor: ExpenseCap;
    materials: ExpenseCap;
    software: ExpenseCap;
    overhead: ExpenseCap;
  };

  /** Eligible expense types for this country */
  eligibleExpenseTypes: string[];

  /** Maximum annual claim amount (null = unlimited) */
  maxAnnualClaim: number | null;

  /** Minimum R&D score threshold (0.0 - 1.0) for project to qualify */
  minRdScoreThreshold: number;

  /** Whether SME-specific enhanced rates are available */
  smeEnhancedRate: number | null;
  /** Revenue threshold to qualify as SME (null = no distinction) */
  smeRevenueThreshold: number | null;

  /** Additional notes for claim generation context */
  notes: string;
}

// ─── Country Configurations ────────────────────────────────────────────────

export const COUNTRY_TAX_RULES: Record<string, CountryTaxRule> = {
  NL: {
    countryCode: 'NL',
    countryName: 'Netherlands',
    programName: 'WBSO (Wet Bevordering Speur- en Ontwikkelingswerk)',
    currency: 'EUR',
    baseCreditRate: 0.32,
    tieredRates: [
      { upTo: 350000, rate: 0.32 },
      { upTo: null, rate: 0.16 },
    ],
    expenseCaps: {
      salary: { maxAmount: null, eligiblePercentage: 1.0 },
      contractor: { maxAmount: null, eligiblePercentage: 0.8 },
      materials: { maxAmount: null, eligiblePercentage: 0.5 },
      software: { maxAmount: null, eligiblePercentage: 0.7 },
      overhead: { maxAmount: null, eligiblePercentage: 0.0 },
    },
    eligibleExpenseTypes: ['salary', 'contractor', 'materials', 'software'],
    maxAnnualClaim: null,
    minRdScoreThreshold: 0.5,
    smeEnhancedRate: 0.40,
    smeRevenueThreshold: 50_000_000,
    notes:
      'WBSO provides wage tax reduction for R&D hours. Starters get 40% on first €350K bracket.',
  },

  UK: {
    countryCode: 'UK',
    countryName: 'United Kingdom',
    programName: 'R&D Tax Relief (SME & RDEC)',
    currency: 'GBP',
    baseCreditRate: 0.20,
    tieredRates: null,
    expenseCaps: {
      salary: { maxAmount: null, eligiblePercentage: 1.0 },
      contractor: { maxAmount: null, eligiblePercentage: 0.65 },
      materials: { maxAmount: null, eligiblePercentage: 1.0 },
      software: { maxAmount: null, eligiblePercentage: 1.0 },
      overhead: { maxAmount: null, eligiblePercentage: 0.0 },
    },
    eligibleExpenseTypes: ['salary', 'contractor', 'materials', 'software'],
    maxAnnualClaim: null,
    minRdScoreThreshold: 0.5,
    smeEnhancedRate: 0.2608,
    smeRevenueThreshold: 100_000_000,
    notes:
      'RDEC: 20% above-the-line credit. SME enhanced: 86% additional deduction + 10% payable credit for loss-making.',
  },

  FR: {
    countryCode: 'FR',
    countryName: 'France',
    programName: "Crédit d'Impôt Recherche (CIR)",
    currency: 'EUR',
    baseCreditRate: 0.30,
    tieredRates: [
      { upTo: 100_000_000, rate: 0.30 },
      { upTo: null, rate: 0.05 },
    ],
    expenseCaps: {
      salary: { maxAmount: null, eligiblePercentage: 1.0 },
      contractor: { maxAmount: null, eligiblePercentage: 1.0 },
      materials: { maxAmount: null, eligiblePercentage: 1.0 },
      software: { maxAmount: null, eligiblePercentage: 0.75 },
      overhead: { maxAmount: null, eligiblePercentage: 0.43 },
    },
    eligibleExpenseTypes: [
      'salary',
      'contractor',
      'materials',
      'software',
      'overhead',
    ],
    maxAnnualClaim: null,
    minRdScoreThreshold: 0.5,
    smeEnhancedRate: null,
    smeRevenueThreshold: null,
    notes:
      'CIR: 30% on first €100M, 5% above. Overhead calculated as forfait at 43% of salary costs.',
  },

  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    programName: 'Forschungszulage',
    currency: 'EUR',
    baseCreditRate: 0.25,
    tieredRates: null,
    expenseCaps: {
      salary: { maxAmount: 2_000_000, eligiblePercentage: 1.0 },
      contractor: { maxAmount: 2_000_000, eligiblePercentage: 0.6 },
      materials: { maxAmount: null, eligiblePercentage: 0.0 },
      software: { maxAmount: null, eligiblePercentage: 0.0 },
      overhead: { maxAmount: null, eligiblePercentage: 0.0 },
    },
    eligibleExpenseTypes: ['salary', 'contractor'],
    maxAnnualClaim: 1_000_000,
    minRdScoreThreshold: 0.5,
    smeEnhancedRate: null,
    smeRevenueThreshold: null,
    notes:
      'Forschungszulage: 25% on eligible salary/contractor costs up to €2M base per category. Max benefit €1M/year.',
  },

  /** Default/fallback — conservative MVP rules from tz.txt */
  DEFAULT: {
    countryCode: 'DEFAULT',
    countryName: 'Generic (MVP)',
    programName: 'Generic R&D Tax Credit',
    currency: 'EUR',
    baseCreditRate: 0.20,
    tieredRates: null,
    expenseCaps: {
      salary: { maxAmount: null, eligiblePercentage: 1.0 },
      contractor: { maxAmount: null, eligiblePercentage: 0.65 },
      materials: { maxAmount: null, eligiblePercentage: 0.0 },
      software: { maxAmount: null, eligiblePercentage: 0.0 },
      overhead: { maxAmount: null, eligiblePercentage: 0.0 },
    },
    eligibleExpenseTypes: ['salary', 'contractor'],
    maxAnnualClaim: null,
    minRdScoreThreshold: 0.5,
    smeEnhancedRate: null,
    smeRevenueThreshold: null,
    notes: 'Fallback rule set: 20% on salary + 65% of contractors. No material/SW credits.',
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Get tax rules for a country code. Falls back to DEFAULT if unknown.
 */
export function getTaxRules(countryCode: string): CountryTaxRule {
  const normalized = countryCode.toUpperCase().trim();
  return COUNTRY_TAX_RULES[normalized] ?? COUNTRY_TAX_RULES['DEFAULT'];
}

/**
 * List all supported country codes.
 */
export function getSupportedCountries(): string[] {
  return Object.keys(COUNTRY_TAX_RULES).filter((k) => k !== 'DEFAULT');
}
