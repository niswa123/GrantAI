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

  /** Legal framework/regulation name for prompts */
  legalFramework: string;

  /** Country-specific terminology used in legal definitions */
  terminology: {
    advance: string;
    uncertainty: string;
  };

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
    legalFramework: 'WBSO',
    terminology: { advance: 'technologische vooruitgang', uncertainty: 'technische onzekerheid' },
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
    legalFramework: 'HMRC R&D Tax Relief',
    terminology: { advance: 'advance in science or technology', uncertainty: 'technological uncertainty' },
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
    legalFramework: 'Crédit d\'Impôt Recherche (CIR)',
    terminology: { advance: 'avancement des connaissances', uncertainty: 'incertitude scientifique ou technique' },
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
    legalFramework: 'Forschungszulage',
    terminology: { advance: 'Stand der Technik überschreiten', uncertainty: 'technische Unsicherheit' },
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
    legalFramework: 'Generic R&D Tax Credit',
    terminology: { advance: 'technological advance', uncertainty: 'technological uncertainty' },
    notes: 'Fallback rule set: 20% on salary + 65% of contractors. No material/SW credits.',
  },

  BE: {
    countryCode: 'BE',
    countryName: 'Belgium',
    programName: 'R&D Tax Incentives (Partial Wage Withholding Tax Exemption)',
    currency: 'EUR',
    baseCreditRate: 0.80,
    tieredRates: null,
    expenseCaps: {
      salary: { maxAmount: null, eligiblePercentage: 1.0 },
      contractor: { maxAmount: null, eligiblePercentage: 0.0 },
      materials: { maxAmount: null, eligiblePercentage: 0.0 },
      software: { maxAmount: null, eligiblePercentage: 0.0 },
      overhead: { maxAmount: null, eligiblePercentage: 0.0 },
    },
    eligibleExpenseTypes: ['salary'],
    maxAnnualClaim: null,
    minRdScoreThreshold: 0.5,
    smeEnhancedRate: null,
    smeRevenueThreshold: null,
    legalFramework: 'Belgian R&D Tax Incentives',
    terminology: { advance: 'technological advance', uncertainty: 'technological uncertainty' },
    notes: 'Belgium offers 80% partial exemption from withholding tax on R&D salaries. Requires researchers with qualifying degrees.',
  },

  SE: {
    countryCode: 'SE',
    countryName: 'Sweden',
    programName: 'FoU-avdrag (R&D Tax Deduction)',
    currency: 'SEK',
    baseCreditRate: 0.20,
    tieredRates: null,
    expenseCaps: {
      salary: { maxAmount: 6_000_000, eligiblePercentage: 1.0 },
      contractor: { maxAmount: null, eligiblePercentage: 0.0 },
      materials: { maxAmount: null, eligiblePercentage: 0.0 },
      software: { maxAmount: null, eligiblePercentage: 0.0 },
      overhead: { maxAmount: null, eligiblePercentage: 0.0 },
    },
    eligibleExpenseTypes: ['salary'],
    maxAnnualClaim: 1_200_000,
    minRdScoreThreshold: 0.5,
    smeEnhancedRate: null,
    smeRevenueThreshold: null,
    legalFramework: 'FoU-avdrag',
    terminology: { advance: 'vetenskaplig eller teknisk framsteg', uncertainty: 'teknisk osäkerhet' },
    notes: 'Sweden: 20% reduction on employer social security contributions for R&D staff. Max SEK 6M salary base, max SEK 1.2M benefit/year.',
  },

  IE: {
    countryCode: 'IE',
    countryName: 'Ireland',
    programName: 'R&D Tax Credit (Section 766)',
    currency: 'EUR',
    baseCreditRate: 0.30,
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
    smeEnhancedRate: null,
    smeRevenueThreshold: null,
    legalFramework: 'R&D Tax Credit (Section 766)',
    terminology: { advance: 'scientific or technological advancement', uncertainty: 'scientific or technological uncertainty' },
    notes: 'Ireland: 30% tax credit on qualifying R&D expenditure. Volume-based (no incremental). Payable credit available for loss-making companies.',
  },

  ES: {
    countryCode: 'ES',
    countryName: 'Spain',
    programName: 'Deducción por I+D+i (R&D Tax Deduction)',
    currency: 'EUR',
    baseCreditRate: 0.25,
    tieredRates: [
      { upTo: null, rate: 0.25 },
    ],
    expenseCaps: {
      salary: { maxAmount: null, eligiblePercentage: 1.0 },
      contractor: { maxAmount: null, eligiblePercentage: 1.0 },
      materials: { maxAmount: null, eligiblePercentage: 1.0 },
      software: { maxAmount: null, eligiblePercentage: 0.5 },
      overhead: { maxAmount: null, eligiblePercentage: 0.0 },
    },
    eligibleExpenseTypes: ['salary', 'contractor', 'materials', 'software'],
    maxAnnualClaim: null,
    minRdScoreThreshold: 0.5,
    smeEnhancedRate: 0.42,
    smeRevenueThreshold: 50_000_000,
    legalFramework: 'Deducción por I+D+i',
    terminology: { advance: 'avance tecnológico', uncertainty: 'incertidumbre tecnológica' },
    notes: 'Spain: 25% base deduction for R&D, 42% for projects exceeding prior 2-year average. Additional 17% for qualified R&D staff.',
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
