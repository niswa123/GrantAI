/**
 * "Компания Ромашка" — End-to-End Test Fixture.
 *
 * A realistic test dataset for the first integration pass of the R&D pipeline.
 * Covers: classification input shape, calculation engine, sanity checks, claim text output.
 *
 * Scenario:
 *   - Russian IT company "Ромашка" (Romashka LLC), operating in NL jurisdiction
 *   - 2 IT projects, total expenses €50,000
 *   - Expected: ~€10,400 tax credit (NL WBSO base rate 32% on eligible salary)
 */

import { type CalculationInput } from '../calculation.engine';

// ─── Company Profile ─────────────────────────────────────────────────────────

export const ROMASHKA_COMPANY = {
  id: 'test-company-romashka-001',
  user_id: 'test-user-001',
  name: 'Romashka LLC',
  country: 'NL',
  industry: 'Information Technology',
};

// ─── Projects ────────────────────────────────────────────────────────────────

export const ROMASHKA_PROJECTS = [
  {
    id: 'test-project-001',
    company_id: 'test-company-romashka-001',
    title: 'AI-powered Document Classifier',
    description:
      'Development of a custom NLP model to automatically categorize legal documents. ' +
      'The project involves training transformer-based models on proprietary datasets, ' +
      'addressing technical uncertainty around model accuracy for Dutch legal terminology ' +
      'that has no prior training data. The team is solving novel classification problems ' +
      'that exceed the state of the art for this domain.',
    is_rd: true,
    rd_score: 0.85,
  },
  {
    id: 'test-project-002',
    company_id: 'test-company-romashka-001',
    title: 'Real-time Tax Credit Calculation Engine',
    description:
      'Engineering a modular, country-agnostic calculation engine for R&D tax credits. ' +
      'Technical challenges include: handling floating-point precision in multi-currency ' +
      'scenarios, designing a tiered-rate system that is provably correct under all edge cases, ' +
      'and creating a zero-hardcode architecture that allows new jurisdictions to be added ' +
      'without modifying core business logic. This required novel algorithmic design.',
    is_rd: true,
    rd_score: 0.78,
  },
];

// ─── Expenses (€50,000 total) ─────────────────────────────────────────────────

export const ROMASHKA_EXPENSES = [
  {
    id: 'test-expense-001',
    company_id: 'test-company-romashka-001',
    type: 'salary',
    amount: 32500,      // Two engineers × partial year
    currency: 'EUR',
    date: '2024-01-01',
    description: 'Salary costs for 2 ML engineers working on document classifier (Project 1)',
    is_rd_related: true,
  },
  {
    id: 'test-expense-002',
    company_id: 'test-company-romashka-001',
    type: 'contractor',
    amount: 12000,      // External NLP consultant
    currency: 'EUR',
    date: '2024-03-15',
    description: 'External NLP specialist for transformer model architecture review',
    is_rd_related: true,
  },
  {
    id: 'test-expense-003',
    company_id: 'test-company-romashka-001',
    type: 'software',
    amount: 3500,       // GPU cloud compute for training
    currency: 'EUR',
    date: '2024-02-01',
    description: 'AWS GPU instances for model training (not eligible in NL WBSO)',
    is_rd_related: true,
  },
  {
    id: 'test-expense-004',
    company_id: 'test-company-romashka-001',
    type: 'salary',
    amount: 2000,       // Internal developer on calculation engine
    currency: 'EUR',
    date: '2024-04-01',
    description: 'Backend developer time on tax calculation engine (Project 2)',
    is_rd_related: true,
  },
];

// ─── Calculation Engine Input ─────────────────────────────────────────────────

export const ROMASHKA_CALC_INPUT: CalculationInput = {
  countryCode: 'NL',
  companyRevenue: 280_000, // Small company
  projects: ROMASHKA_PROJECTS.map((p) => ({
    id: p.id,
    title: p.title,
    rdScore: p.rd_score,
    isRd: p.is_rd,
  })),
  expenses: ROMASHKA_EXPENSES.map((e) => ({
    id: e.id,
    type: e.type,
    amount: e.amount,
    isRdRelated: e.is_rd_related,
    description: e.description,
  })),
};

// ─── Expected Results ─────────────────────────────────────────────────────────

/**
 * Manual calculation for NL (WBSO):
 *
 * Eligible expense types in NL: salary, contractor, materials, software
 * Caps:
 *   salary:      100% eligible, no cap
 *   contractor:  80% eligible, no cap
 *   software:    70% eligible, no cap
 *
 * Qualifying expenses:
 *   salary-001:      32500 × 1.00 = 32500
 *   contractor-002:  12000 × 0.80 = 9600
 *   software-003:    3500  × 0.70 = 2450   ← software is eligible in NL
 *   salary-004:      2000  × 1.00 = 2000
 *
 * Total qualifying: 46550
 *
 * NL Tiered Rates:
 *   First €350,000 at 32%
 *   → 46550 × 0.32 = 14896
 *
 * SME check: revenue 280k < threshold 50M → SME rate 40%
 *   → 46550 × 0.40 = 18620  (SME enhanced rate applies!)
 *
 * No annual cap for NL → estimated_credit = €18,620
 *
 * Sanity checks:
 *   - 18620 < 280000 (revenue) ✓
 *   - 18620 < 46550 (expenses) ✓
 *   - 46550 / 280000 = 16.6% revenue ratio ✓ (< 80% threshold)
 *   → All checks PASS, no warnings
 */
export const ROMASHKA_EXPECTED = {
  countryCode: 'NL',
  rdExpensesTotal: 46550,
  qualifyingProjectsCount: 2,
  companyRdScore: 0.815, // (0.85 + 0.78) / 2
  smeRateApplied: true,
  effectiveCreditRate: 0.40,
  estimatedCreditAmount: 18620,
  sanityWarningsCount: 0,
};

// ─── LLM Input Shapes ─────────────────────────────────────────────────────────

/**
 * Exact JSON shape sent to CLASSIFY_PROJECT prompt for Project 1.
 * Validates that rd-classifier.service.ts constructs the correct payload.
 */
export const ROMASHKA_CLASSIFY_INPUT_PROJECT1 = {
  title: 'AI-powered Document Classifier',
  description: ROMASHKA_PROJECTS[0].description,
  industry: 'Information Technology',
  company_name: 'Romashka LLC',
};

/**
 * Exact JSON shape sent to GENERATE_CLAIM_TEXT prompt.
 * Validates that claims.service.ts constructs the correct payload.
 */
export const ROMASHKA_CLAIM_TEXT_INPUT = {
  company_json: {
    name: 'Romashka LLC',
    country: 'NL',
    industry: 'Information Technology',
  },
  projects_json: [
    {
      title: 'AI-powered Document Classifier',
      description: ROMASHKA_PROJECTS[0].description,
      rd_score: 0.85,
    },
    {
      title: 'Real-time Tax Credit Calculation Engine',
      description: ROMASHKA_PROJECTS[1].description,
      rd_score: 0.78,
    },
  ],
  expenses_json: {
    salary: { total: 34500, count: 2, currency: 'EUR' },
    contractor: { total: 12000, count: 1, currency: 'EUR' },
    software: { total: 3500, count: 1, currency: 'EUR' },
  },
  country: 'NL',
};
