/**
 * Tax Rules Registry — Modular, country-specific R&D tax credit configurations.
 *
 * Each country profile defines:
 * - Credit rate (base percentage of qualifying expenditure)
 * - Expense caps per category
 * - Eligible expense types
 * - Legal frameworks & exact AI prompts for compliance
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

  // ─── Legal AI Prompts ──────────────────────────────────────────────────
  /** The official legal framework for the prompt (e.g., "UK BIS Guidelines (CIRD81900)") */
  legalFramework: string;
  /** The exact prompt instructions derived from the country's tax code */
  legalDefinitionPrompt: string;
  /** Specific terminology the AI should use in the output */
  terminology: {
    uncertainty: string; // e.g., "Technological Uncertainty" or "Technical Bottleneck"
    advance: string;     // e.g., "Advance in overall knowledge"
  };
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
    notes: 'WBSO provides wage tax reduction for R&D hours. Starters get 40% on first €350K bracket.',
    legalFramework: "RVO WBSO Manual",
    legalDefinitionPrompt: `1. The project must involve the development of a technically new physical product, process, or software.
2. The core R&D criterion is the existence of "technische knelpunten" (technical bottlenecks). These are technical problems that could not be solved using available knowledge.
3. For software: It must be "eigen programmatuur" (self-developed software) containing a new technical principle. Integrating existing APIs/frameworks is NOT eligible.`,
    terminology: {
      uncertainty: "Technical Bottleneck (technisch knelpunt)",
      advance: "New technical principle / Technically new development",
    },
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
    notes: 'RDEC: 20% above-the-line credit. SME enhanced: 86% additional deduction + 10% payable credit for loss-making.',
    legalFramework: "HMRC BIS Guidelines (CIRD81900)",
    legalDefinitionPrompt: `1. The project must seek an "advance in science or technology" by resolving "scientific or technological uncertainty".
2. The advance must extend the overall knowledge or capability in a field, not just the company's own state of knowledge.
3. Uncertainty exists when knowledge of whether something is scientifically possible or technologically feasible, or how to achieve it in practice, is not readily available or deducible by a competent professional working in the field.`,
    terminology: {
      uncertainty: "Technological Uncertainty",
      advance: "Advance in overall knowledge / technological capability",
    },
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
    eligibleExpenseTypes: ['salary', 'contractor', 'materials', 'software', 'overhead'],
    maxAnnualClaim: null,
    minRdScoreThreshold: 0.5,
    smeEnhancedRate: null,
    smeRevenueThreshold: null,
    notes: 'CIR: 30% on first €100M, 5% above. Overhead calculated as forfait at 43% of salary costs.',
    legalFramework: "BOI-BIC-RICI-10-10-10-20 (French Tax Code)",
    legalDefinitionPrompt: `1. The project must involve fundamental research, applied research, or experimental development.
2. The work must systematically resolve a scientific or technical uncertainty (dissipation d'une incertitude scientifique et technique).
3. The outcome must represent an appreciable improvement over the existing state of the art (état de l'art), not just a routine modification.`,
    terminology: {
      uncertainty: "Scientific/Technical Uncertainty (incertitude technique)",
      advance: "Appreciable improvement over state-of-the-art (état de l'art)",
    },
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
    notes: 'Forschungszulage: 25% on eligible salary/contractor costs up to €2M base per category.',
    legalFramework: "Forschungszulagengesetz (FZulG)",
    legalDefinitionPrompt: `1. Must meet the core Frascati criteria: Novel, Creative, Uncertain, Systematic, Transferable/Reproducible.
2. The objective must be aimed at new findings.
3. The project involves experimental or theoretical work that resolves technical/scientific risks.`,
    terminology: {
      uncertainty: "Technical/Scientific Risk",
      advance: "Novel Findings / Experimental Development",
    },
  },

  BE: {
    countryCode: 'BE',
    countryName: 'Belgium',
    programName: 'R&D Tax Incentives',
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
    notes: '80% partial exemption from withholding tax on R&D salaries. BELSPO notification required.',
    legalFramework: "BELSPO R&D Guidelines",
    legalDefinitionPrompt: `1. Involves fundamental research, industrial research, or experimental development.
2. Must seek to resolve scientific or technological uncertainties.
3. Emphasizes the need for structured planning and qualified research personnel.`,
    terminology: {
      uncertainty: "Technological/Scientific Uncertainty",
      advance: "Experimental Development",
    },
  },

  SE: {
    countryCode: 'SE',
    countryName: 'Sweden',
    programName: 'FoU-avdrag',
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
    notes: 'FoU-avdrag: 20% reduction on employer social security contributions for R&D staff.',
    legalFramework: "Skatteverket R&D Definitions (FoU-avdrag)",
    legalDefinitionPrompt: `1. The work must be systematic and qualified research or development.
2. Aimed at bringing about new knowledge or new products, processes, or services.
3. Must be an appreciable improvement, not routine maintenance or simple upgrades.`,
    terminology: {
      uncertainty: "Systematic Technical Challenge",
      advance: "New Knowledge / Appreciable Improvement",
    },
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
    notes: 'Ireland: 30% tax credit on qualifying R&D expenditure. Volume-based (no incremental).',
    legalFramework: "Revenue Commissioners Section 766 R&D Guidelines",
    legalDefinitionPrompt: `1. Activities must be basic research, applied research, or experimental development.
2. Must seek to achieve scientific or technological advancement.
3. Must involve the resolution of scientific or technological uncertainty in a systematic, investigative, or experimental manner.`,
    terminology: {
      uncertainty: "Scientific or Technological Uncertainty",
      advance: "Scientific or Technological Advancement",
    },
  },

  ES: {
    countryCode: 'ES',
    countryName: 'Spain',
    programName: 'Deducción por I+D+i',
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
    notes: 'Spain: 25% base deduction for R&D, 42% for projects exceeding prior 2-year average.',
    legalFramework: "Ley del Impuesto sobre Sociedades (LIS) Art. 35",
    legalDefinitionPrompt: `1. I+D involves original planned investigation seeking new knowledge or a significant technological improvement.
2. Must resolve a substantive technical challenge leading to new products, processes, or materials.
3. Routine software development does not qualify unless it represents a substantial scientific or technological advance.`,
    terminology: {
      uncertainty: "Substantive Technical Challenge (Reto técnico)",
      advance: "Significant Technological Improvement (Novedad tecnológica)",
    },
  },

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
    notes: 'Fallback rule set using OECD Frascati baseline.',
    legalFramework: "OECD Frascati Manual",
    legalDefinitionPrompt: `1. The activity must be: novel, creative, uncertain, systematic, and transferable/reproducible.
2. It must seek to resolve a technological or scientific uncertainty.
3. The goal must be to increase the stock of knowledge.`,
    terminology: {
      uncertainty: "Technological/Scientific Uncertainty",
      advance: "Technological Advance",
    },
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
