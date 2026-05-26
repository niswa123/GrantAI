export interface SchemeEntry {
  code: string;
  name: string;
  description: string;
  formulaDescription: string;
  ratePct: number;
}

export interface JurisdictionEntry {
  code: string;
  country: string;
  flag: string;
  schemes: SchemeEntry[];
}

export const JURISDICTION_REGISTRY: JurisdictionEntry[] = [
  {
    code: 'NL',
    country: 'Netherlands',
    flag: '🇳🇱',
    schemes: [
      {
        code: 'WBSO',
        name: 'WBSO Standard',
        description: '32% of R&D salary costs up to €350,000, and 16% for costs above €350,000.',
        formulaDescription: '32% up to €350k, 16% above',
        ratePct: 32,
      },
      {
        code: 'WBSO_STARTER',
        name: 'WBSO Starter',
        description: '40% of R&D salary costs up to €350,000 for startups/new entrepreneurs, and 16% above €350,000.',
        formulaDescription: '40% up to €350k, 16% above',
        ratePct: 40,
      },
    ],
  },
  {
    code: 'UK',
    country: 'United Kingdom',
    flag: '🇬🇧',
    schemes: [
      {
        code: 'UK_SME',
        name: 'HMRC SME Scheme',
        description: 'For SMEs. Profitable companies deduct an additional 86% of R&D costs, yielding ~21.5% benefit (at 25% CIT). Loss-making companies can claim a cash credit of 14.5% of surrenderable losses.',
        formulaDescription: '21.5% if profitable, 14.5% cash if loss-making',
        ratePct: 21.5,
      },
      {
        code: 'UK_RDEC',
        name: 'HMRC RDEC Scheme',
        description: 'Research and Development Expenditure Credit (RDEC) offering a 20% direct tax credit (taxable).',
        formulaDescription: '20% direct credit',
        ratePct: 20,
      },
    ],
  },
  {
    code: 'DE',
    country: 'Germany',
    flag: '🇩🇪',
    schemes: [
      {
        code: 'DE_FZULG',
        name: 'Forschungszulage (FZulG)',
        description: 'R&D tax subsidy of 25% of eligible R&D costs (mainly salaries). Capped at €4,000,000 eligible costs per year (max €1,000,000 benefit).',
        formulaDescription: '25% of costs, capped at €4M expenses',
        ratePct: 25,
      },
    ],
  },
  {
    code: 'FR',
    country: 'France',
    flag: '🇫🇷',
    schemes: [
      {
        code: 'FR_CIR',
        name: 'Crédit d’Impôt Recherche (CIR)',
        description: '30% tax credit for eligible R&D expenses up to €100 million, and 5% for expenses above this threshold.',
        formulaDescription: '30% up to €100M, 5% above',
        ratePct: 30,
      },
    ],
  },
  {
    code: 'IE',
    country: 'Ireland',
    flag: '🇮🇪',
    schemes: [
      {
        code: 'IE_CREDIT',
        name: 'R&D Tax Credit',
        description: '25% tax credit on qualifying R&D expenditure, usable to reduce CIT or claimed as cash refund.',
        formulaDescription: '25% direct credit',
        ratePct: 25,
      },
    ],
  },
  {
    code: 'SE',
    country: 'Sweden',
    flag: '🇸🇪',
    schemes: [
      {
        code: 'SE_VAXA',
        name: 'Växa-stöd',
        description: 'Reduction of social security contributions for R&D employees from 31.42% down to 10.21% (a saving of 19.59% of salaries).',
        formulaDescription: '19.59% social contribution reduction',
        ratePct: 19.59,
      },
    ],
  },
  {
    code: 'BE',
    country: 'Belgium',
    flag: '🇧🇪',
    schemes: [
      {
        code: 'BE_WITHHOLDING',
        name: 'Withholding Tax Exemption',
        description: '80% exemption from transferring withholding tax on salaries of qualifying R&D employees (reduces actual payroll costs).',
        formulaDescription: '80% withholding tax exemption',
        ratePct: 80,
      },
    ],
  },
  {
    code: 'AT',
    country: 'Austria',
    flag: '🇦🇹',
    schemes: [
      {
        code: 'AT_FORSCHUNG',
        name: 'Forschungsprämie',
        description: '14% cash premium (Forschungsprämie) on all eligible R&D expenditures. Non-taxable.',
        formulaDescription: '14% direct cash premium',
        ratePct: 14,
      },
    ],
  },
  {
    code: 'PL',
    country: 'Poland',
    flag: '🇵🇱',
    schemes: [
      {
        code: 'PL_SUPER_DED',
        name: 'R&D Super Deduction',
        description: 'Deduct up to 200% of qualified R&D costs from CIT base. At standard 19% CIT rate, this yields an effective ~38% benefit.',
        formulaDescription: '200% deduction (~38% effective benefit)',
        ratePct: 38,
      },
    ],
  },
  {
    code: 'EE',
    country: 'Estonia',
    flag: '🇪🇪',
    schemes: [
      {
        code: 'EE_RD_DED',
        name: 'Estonian R&D Deduction',
        description: 'Up to 300% super deduction on R&D costs. Under Estonian unique CIT system (20% on distribution), yields approx 40% effective benefit.',
        formulaDescription: '300% deduction (~40% effective benefit)',
        ratePct: 40,
      },
    ],
  },
  {
    code: 'ES',
    country: 'Spain',
    flag: '🇪🇸',
    schemes: [
      {
        code: 'ES_IDI',
        name: 'Deducción por I+D+i',
        description: 'R&D tax credit offering 25% base rate, increasing up to 42% if R&D spending exceeds the average of the previous two years.',
        formulaDescription: '25% base credit, up to 42% for growth',
        ratePct: 25,
      },
    ],
  },
  {
    code: 'US',
    country: 'United States',
    flag: '🇺🇸',
    schemes: [
      {
        code: 'US_SEC41',
        name: 'Section 41 R&D Credit',
        description: 'Federal R&D tax credit offering up to 20% (or 14% under the Alternative Simplified Credit method) on qualified research expenses.',
        formulaDescription: '20% tax credit (or 14% ASC)',
        ratePct: 20,
      },
    ],
  },
  {
    code: 'CN',
    country: 'China',
    flag: '🇨🇳',
    schemes: [
      {
        code: 'CN_SUPER_DED',
        name: 'R&D Super Deduction',
        description: '175% super deduction for corporate income tax (CIT) purposes. For manufacturing/SMEs, it is 200% super deduction. Effective benefit of ~43.75% to 50%.',
        formulaDescription: '175% to 200% deduction (~43.75% - 50% benefit)',
        ratePct: 43.75,
      },
    ],
  },
  {
    code: 'TH',
    country: 'Thailand',
    flag: '🇹🇭',
    schemes: [
      {
        code: 'TH_BOI_RD',
        name: 'BOI R&D Tax Incentive',
        description: 'Up to 300% deduction of corporate income tax base for qualifying R&D expenses. At standard 20% CIT, yields 60% effective savings.',
        formulaDescription: '300% super deduction (~60% benefit)',
        ratePct: 60,
      },
    ],
  },
  {
    code: 'VN',
    country: 'Vietnam',
    flag: '🇻🇳',
    schemes: [
      {
        code: 'VN_HITECH',
        name: 'High-Tech Enterprise CIT Incentive',
        description: 'Preferential CIT rate of 10% (instead of standard 20%) for accredited high-tech companies. Yields approximately ~10% CIT savings on profits.',
        formulaDescription: 'Reduced CIT rate (10% CIT savings approximation)',
        ratePct: 15,
      },
    ],
  },
  {
    code: 'MANUAL',
    country: 'Other / Manual',
    flag: '🌍',
    schemes: [
      {
        code: 'MANUAL',
        name: 'Manual Tax Credit Rate',
        description: 'Fallback scheme utilizing the custom tax credit rate defined directly in your workspace settings.',
        formulaDescription: 'Uses custom workspace tax credit %',
        ratePct: 14,
      },
    ],
  },
];

export interface TaxCalculationParams {
  jurisdictionCode: string;
  scheme: string;
  rdCostEur: number;
  isStartup?: boolean;
  isProfitable?: boolean;
  taxCreditRateFallback?: number;
}

/**
 * Calculates the exact R&D tax benefit or savings based on the country, selected scheme, and R&D cost.
 */
export function calculateTaxBenefit(params: TaxCalculationParams): number {
  const { jurisdictionCode, scheme, rdCostEur, isStartup = false, isProfitable = true, taxCreditRateFallback = 0.14 } = params;

  if (rdCostEur <= 0) return 0;

  let benefit = 0;

  switch (jurisdictionCode) {
    case 'NL':
      if (scheme === 'WBSO_STARTER') {
        // 40% up to 350,000, 16% above
        if (rdCostEur <= 350000) {
          benefit = rdCostEur * 0.40;
        } else {
          benefit = (350000 * 0.40) + ((rdCostEur - 350000) * 0.16);
        }
      } else {
        // WBSO Standard: 32% up to 350,000, 16% above
        if (rdCostEur <= 350000) {
          benefit = rdCostEur * 0.32;
        } else {
          benefit = (350000 * 0.32) + ((rdCostEur - 350000) * 0.16);
        }
      }
      break;

    case 'UK':
      if (scheme === 'UK_SME') {
        if (isProfitable) {
          // 86% super-deduction. Standard CIT is 25%.
          // Benefit: rdCostEur * 86% * 25% = 21.5%
          benefit = rdCostEur * 0.86 * 0.25;
        } else {
          // Surrenderable loss credit: 14.5% of surrenderable R&D loss (usually 186% of R&D cost).
          // To keep it simple & robust: standard 14.5% of R&D cost as direct credit cashback
          benefit = rdCostEur * 0.145;
        }
      } else if (scheme === 'UK_RDEC') {
        // 20% direct tax credit (subject to CIT, but let's approximate as 20% gross credit)
        benefit = rdCostEur * 0.20;
      } else {
        benefit = rdCostEur * 0.20;
      }
      break;

    case 'DE':
      // 25% of eligible R&D costs, capped at €4M expenses (€1M max benefit)
      const deEligibleCosts = Math.min(rdCostEur, 4000000);
      benefit = deEligibleCosts * 0.25;
      break;

    case 'FR':
      // 30% up to €100M, 5% above
      if (rdCostEur <= 100000000) {
        benefit = rdCostEur * 0.30;
      } else {
        benefit = (100000000 * 0.30) + ((rdCostEur - 100000000) * 0.05);
      }
      break;

    case 'IE':
      benefit = rdCostEur * 0.25;
      break;

    case 'SE':
      // 19.59% of R&D salaries
      benefit = rdCostEur * 0.1959;
      break;

    case 'BE':
      // 80% withholding exemption
      benefit = rdCostEur * 0.80;
      break;

    case 'AT':
      benefit = rdCostEur * 0.14;
      break;

    case 'PL':
      // 200% deduction × 19% CIT = 38% effective
      benefit = rdCostEur * 2.0 * 0.19;
      break;

    case 'EE':
      // 300% deduction × 20% CIT = 60%, approximated at 40% standard effective rate
      benefit = rdCostEur * 0.40;
      break;

    case 'ES':
      // 25% base, up to 42% for growth
      benefit = rdCostEur * (isStartup ? 0.42 : 0.25);
      break;

    case 'US':
      // Section 41: 20% regular credit (or 14% ASC)
      benefit = rdCostEur * (isStartup ? 0.14 : 0.20);
      break;

    case 'CN':
      // 175% or 200% super deduction × 25% CIT
      // 175% × 25% = 43.75%, 200% × 25% = 50%
      const cnRate = isStartup ? 0.50 : 0.4375;
      benefit = rdCostEur * cnRate;
      break;

    case 'TH':
      // 300% deduction × 20% CIT = 60%
      benefit = rdCostEur * 0.60;
      break;

    case 'VN':
      // Hi-Tech CIT reduced to 10% from 20% (approx 10% of profit).
      // We proxy profit as 1.5 × R&D cost, yielding ~15% of R&D costs
      benefit = rdCostEur * 0.15;
      break;

    case 'MANUAL':
    default:
      benefit = rdCostEur * taxCreditRateFallback;
      break;
  }

  return Math.round(benefit * 100) / 100;
}

/**
 * Returns the jurisdiction entry matching a given country name (case-insensitive) or code.
 */
export function getJurisdictionByCountry(countryNameOrCode: string): JurisdictionEntry | null {
  if (!countryNameOrCode) return null;
  
  const normalized = countryNameOrCode.trim().toLowerCase();
  
  // Try finding by 2-letter code
  let found = JURISDICTION_REGISTRY.find(j => j.code.toLowerCase() === normalized);
  if (found) return found;

  // Try finding by country name
  found = JURISDICTION_REGISTRY.find(j => j.country.toLowerCase() === normalized);
  if (found) return found;

  // Fallback to manual
  return JURISDICTION_REGISTRY.find(j => j.code === 'MANUAL') || null;
}
