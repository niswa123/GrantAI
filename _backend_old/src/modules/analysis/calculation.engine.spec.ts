import {
  calculateTaxCredit,
  type CalculationInput,
  roundTo,
} from './calculation.engine';
import { COUNTRY_TAX_RULES } from './tax-rules.registry';

describe('Calculation Engine', () => {
  const baseInput: CalculationInput = {
    countryCode: 'DEFAULT',
    projects: [
      { id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true },
      { id: 'p2', title: 'Project 2', rdScore: 0.3, isRd: false },
    ],
    expenses: [
      { id: 'e1', type: 'salary', amount: 100000, isRdRelated: true },
      { id: 'e2', type: 'contractor', amount: 50000, isRdRelated: true },
      { id: 'e3', type: 'software', amount: 10000, isRdRelated: false },
    ],
  };

  it('should correctly filter projects based on score threshold', () => {
    const result = calculateTaxCredit(baseInput);

    // Only p1 should qualify based on DEFAULT rules (minScore 0.5)
    expect(result.qualifyingProjectsCount).toBe(1);
    expect(result.companyRdScore).toBe(0.8);
  });

  it('should apply correct caps and eligible percentages for DEFAULT (MVP)', () => {
    const result = calculateTaxCredit(baseInput);

    // DEFAULT rules:
    // Salary: 100% eligible
    // Contractor: 65% eligible
    // Software: 0% eligible
    // Total eligible = 100000 + (50000 * 0.65) = 132500
    // Rate = 20%
    const expectedEligible = 100000 + 50000 * 0.65;
    expect(result.rdExpensesTotal).toBe(expectedEligible);
    expect(result.estimatedCreditAmount).toBe(expectedEligible * 0.2);
  });

  describe('Edge Cases', () => {
    it('should handle zero projects gracefully', () => {
      const input: CalculationInput = {
        countryCode: 'DEFAULT',
        projects: [],
        expenses: [
          { id: 'e1', type: 'salary', amount: 100000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      expect(result.qualifyingProjectsCount).toBe(0);
      expect(result.companyRdScore).toBe(0);
      expect(result.sanityWarnings).toContainEqual(
        expect.objectContaining({ code: 'NO_QUALIFYING_PROJECTS' })
      );
    });

    it('should handle zero expenses gracefully', () => {
      const input: CalculationInput = {
        countryCode: 'DEFAULT',
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true }],
        expenses: [],
      };

      const result = calculateTaxCredit(input);

      expect(result.rdExpensesTotal).toBe(0);
      expect(result.nonRdExpensesTotal).toBe(0);
      expect(result.estimatedCreditAmount).toBe(0);
    });

    it('should handle all non-R&D expenses', () => {
      const input: CalculationInput = {
        countryCode: 'DEFAULT',
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true }],
        expenses: [
          { id: 'e1', type: 'salary', amount: 100000, isRdRelated: false },
          { id: 'e2', type: 'contractor', amount: 50000, isRdRelated: false },
        ],
      };

      const result = calculateTaxCredit(input);

      expect(result.rdExpensesTotal).toBe(0);
      expect(result.nonRdExpensesTotal).toBe(150000);
      expect(result.estimatedCreditAmount).toBe(0);
    });

    it('should handle ineligible expense types', () => {
      const input: CalculationInput = {
        countryCode: 'DEFAULT',
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true }],
        expenses: [
          { id: 'e1', type: 'marketing', amount: 50000, isRdRelated: true },
          { id: 'e2', type: 'travel', amount: 10000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      expect(result.rdExpensesTotal).toBe(0);
      expect(result.nonRdExpensesTotal).toBe(60000);
      expect(result.expenseBreakdown).toHaveLength(2);
      expect(result.expenseBreakdown[0].reason).toContain('not eligible');
    });

    it('should apply expense caps correctly', () => {
      const input: CalculationInput = {
        countryCode: 'DE',
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true }],
        expenses: [
          { id: 'e1', type: 'salary', amount: 5000000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      // DE has a 2M cap on salary
      expect(result.rdExpensesTotal).toBe(2000000);
      expect(result.expenseBreakdown[0].cappedAmount).toBe(2000000);
      expect(result.expenseBreakdown[0].originalAmount).toBe(5000000);
    });

    it('should handle projects at exact threshold', () => {
      const input: CalculationInput = {
        countryCode: 'DEFAULT',
        projects: [
          { id: 'p1', title: 'Project 1', rdScore: 0.5, isRd: true }, // Exactly at threshold
          { id: 'p2', title: 'Project 2', rdScore: 0.49, isRd: true }, // Just below
        ],
        expenses: [
          { id: 'e1', type: 'salary', amount: 100000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      // Only p1 should qualify (>= 0.5)
      expect(result.qualifyingProjectsCount).toBe(1);
      expect(result.companyRdScore).toBe(0.5);
    });

    it('should handle very small amounts correctly', () => {
      const input: CalculationInput = {
        countryCode: 'DEFAULT',
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true }],
        expenses: [
          { id: 'e1', type: 'salary', amount: 0.01, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      expect(result.rdExpensesTotal).toBe(0.01);
      expect(result.estimatedCreditAmount).toBe(0);
    });

    it('should handle very large amounts correctly', () => {
      const input: CalculationInput = {
        countryCode: 'DEFAULT',
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true }],
        expenses: [
          { id: 'e1', type: 'salary', amount: 999999999, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      expect(result.rdExpensesTotal).toBe(999999999);
      expect(result.estimatedCreditAmount).toBe(999999999 * 0.2);
    });
  });

  describe('Country Specific Rules', () => {
    it('FR - applies tiered rates and overhead correctly', () => {
      const input: CalculationInput = {
        ...baseInput,
        countryCode: 'FR',
        expenses: [
          { id: 'e1', type: 'salary', amount: 100_000, isRdRelated: true },
          { id: 'e2', type: 'overhead', amount: 43_000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      // FR Rate is 30% first 100M
      // Overhead is eligible at 43%
      const overheadEligible = 43000 * 0.43;
      const totalEligible = 100000 + overheadEligible;
      const expectedCredit = roundTo(totalEligible * 0.3, 2);

      expect(result.countryCode).toBe('FR');
      expect(result.rdExpensesTotal).toBe(totalEligible);
      expect(result.estimatedCreditAmount).toBe(expectedCredit);
    });

    it('UK - applies SME enhanced rates if revenue threshold met', () => {
      const input: CalculationInput = {
        ...baseInput,
        countryCode: 'UK',
        companyRevenue: 50_000_000, // < 100M threshold
        expenses: [
          { id: 'e1', type: 'salary', amount: 100_000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      expect(result.countryCode).toBe('UK');
      expect(result.smeRateApplied).toBe(true);
      
      const rate = COUNTRY_TAX_RULES['UK'].smeEnhancedRate!;
      expect(result.effectiveCreditRate).toBe(rate);
      expect(result.estimatedCreditAmount).toBe(roundTo(100_000 * rate, 2));
    });

    it('UK - applies standard (RDEC) rates if revenue threshold exceeded', () => {
      const input: CalculationInput = {
        ...baseInput,
        countryCode: 'UK',
        companyRevenue: 200_000_000, // > 100M threshold
        expenses: [
          { id: 'e1', type: 'salary', amount: 100_000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      expect(result.countryCode).toBe('UK');
      expect(result.smeRateApplied).toBe(false);
      
      const rate = COUNTRY_TAX_RULES['UK'].baseCreditRate;
      expect(result.effectiveCreditRate).toBe(rate);
      expect(result.estimatedCreditAmount).toBe(roundTo(100_000 * rate, 2));
    });

    it('UK - handles edge case at exact SME threshold', () => {
      const input: CalculationInput = {
        ...baseInput,
        countryCode: 'UK',
        companyRevenue: 100_000_000, // Exactly at threshold
        expenses: [
          { id: 'e1', type: 'salary', amount: 100_000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      // At threshold, should NOT qualify for SME (< threshold required)
      expect(result.smeRateApplied).toBe(false);
    });

    it('DE - applies maximum claim cap', () => {
      const input: CalculationInput = {
        ...baseInput,
        countryCode: 'DE',
        expenses: [
          { id: 'e1', type: 'salary', amount: 5_000_000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      // DE rules:
      // Max salary amount capped at 2M (per config, note this is per category in DB but simpler here)
      // Actually config is max Amount: 2M per category
      // Eligible: 2M * 100% = 2M
      // Rate: 25% -> 500,000
      expect(result.rdExpensesTotal).toBe(2_000_000); 
      expect(result.estimatedCreditAmount).toBe(500_000);
      
      // Let's test the overall system cap by pushing expenses higher
       const highInput: CalculationInput = {
        ...baseInput,
        countryCode: 'DE',
        expenses: [
          { id: 'e1', type: 'salary', amount: 2_000_000, isRdRelated: true }, // 2m max
          { id: 'e2', type: 'contractor', amount: 2_000_000, isRdRelated: true }, // 60% of 2m = 1.2m
        ],
      };

      const highResult = calculateTaxCredit(highInput);
      
      // qualifying = 2m + 1.2m = 3.2m
      // calculated credit = 3.2m * 0.25 = 800k. Still under 1m cap.
      expect(highResult.estimatedCreditAmount).toBe(800_000);
    });

    it('DE - applies annual cap when credit exceeds maximum', () => {
      const input: CalculationInput = {
        countryCode: 'DE',
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true }],
        expenses: [
          { id: 'e1', type: 'salary', amount: 2_000_000, isRdRelated: true },
          { id: 'e2', type: 'contractor', amount: 2_000_000, isRdRelated: true },
          { id: 'e3', type: 'equipment', amount: 2_000_000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      // Total qualifying: 2M + (2M * 0.6) + (2M * 0.5) = 2M + 1.2M + 1M = 4.2M
      // Credit: 4.2M * 0.25 = 1.05M
      // But DE cap is 1M, so should be capped
      expect(result.estimatedCreditAmount).toBe(1_000_000);
      
      const capStep = result.auditTrail.find(s => s.step === 'CAP_APPLIED');
      expect(capStep).toBeDefined();
    });

    it('NL - applies correct rates and expense types', () => {
      const input: CalculationInput = {
        countryCode: 'NL',
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true }],
        expenses: [
          { id: 'e1', type: 'salary', amount: 100_000, isRdRelated: true },
          { id: 'e2', type: 'materials', amount: 50_000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      expect(result.countryCode).toBe('NL');
      // NL rules: salary 100%, materials 50%
      const expectedEligible = 100_000 + (50_000 * 0.5);
      expect(result.rdExpensesTotal).toBe(expectedEligible);
    });
  });

  describe('Sanity Checks', () => {
    it('should flag when credit exceeds revenue', () => {
      const input: CalculationInput = {
        countryCode: 'DEFAULT',
        companyRevenue: 50_000,
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true }],
        expenses: [
          { id: 'e1', type: 'salary', amount: 1_000_000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      // Credit = 1M * 0.2 = 200k, revenue = 50k
      expect(result.sanityWarnings).toContainEqual(
        expect.objectContaining({
          code: 'CREDIT_EXCEEDS_REVENUE',
          severity: 'critical',
        })
      );
    });

    it('should flag high R&D expense ratio', () => {
      const input: CalculationInput = {
        countryCode: 'DEFAULT',
        companyRevenue: 100_000,
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true }],
        expenses: [
          { id: 'e1', type: 'salary', amount: 90_000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      // R&D expenses = 90k, revenue = 100k -> 90% ratio
      expect(result.sanityWarnings).toContainEqual(
        expect.objectContaining({
          code: 'HIGH_EXPENSE_RATIO',
          severity: 'warn',
        })
      );
    });

    it('should flag when no qualifying projects exist', () => {
      const input: CalculationInput = {
        countryCode: 'DEFAULT',
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.3, isRd: false }],
        expenses: [
          { id: 'e1', type: 'salary', amount: 100_000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      expect(result.sanityWarnings).toContainEqual(
        expect.objectContaining({
          code: 'NO_QUALIFYING_PROJECTS',
          severity: 'warn',
        })
      );
    });

    it('should pass sanity checks for valid input', () => {
      const input: CalculationInput = {
        countryCode: 'DEFAULT',
        companyRevenue: 1_000_000,
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true }],
        expenses: [
          { id: 'e1', type: 'salary', amount: 100_000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      expect(result.sanityWarnings).toHaveLength(0);
      const sanityOk = result.auditTrail.find(s => s.step === 'SANITY_OK');
      expect(sanityOk).toBeDefined();
    });
  });

  describe('Tiered Rates', () => {
    it('should calculate tiered credits correctly for FR', () => {
      const input: CalculationInput = {
        countryCode: 'FR',
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true }],
        expenses: [
          { id: 'e1', type: 'salary', amount: 150_000_000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      // FR has tiered rates: 30% up to 100M, 5% above
      // First 100M: 100M * 0.3 = 30M
      // Next 50M: 50M * 0.05 = 2.5M
      // Total: 32.5M
      const expectedCredit = (100_000_000 * 0.3) + (50_000_000 * 0.05);
      expect(result.estimatedCreditAmount).toBe(expectedCredit);
      
      const tierSteps = result.auditTrail.filter(s => s.step === 'TIER_CREDIT');
      expect(tierSteps.length).toBeGreaterThan(0);
    });

    it('should handle expenses below first tier threshold', () => {
      const input: CalculationInput = {
        countryCode: 'FR',
        projects: [{ id: 'p1', title: 'Project 1', rdScore: 0.8, isRd: true }],
        expenses: [
          { id: 'e1', type: 'salary', amount: 50_000_000, isRdRelated: true },
        ],
      };

      const result = calculateTaxCredit(input);

      // All in first tier: 50M * 0.3 = 15M
      expect(result.estimatedCreditAmount).toBe(50_000_000 * 0.3);
    });
  });

  describe('Audit Trail', () => {
    it('produces a comprehensive audit trail', () => {
      const result = calculateTaxCredit(baseInput);

      expect(result.auditTrail.length).toBeGreaterThan(0);
      
      // Must contain essential steps
      const steps = result.auditTrail.map(a => a.step);
      expect(steps).toContain('INIT');
      expect(steps).toContain('FILTER_PROJECTS');
      expect(steps).toContain('COMPANY_RD_SCORE');
      expect(steps).toContain('EXPENSE_PROCESSING');
      expect(steps).toContain('FINAL');
    });

    it('includes detailed expense processing information', () => {
      const result = calculateTaxCredit(baseInput);

      const expenseStep = result.auditTrail.find(s => s.step === 'EXPENSE_PROCESSING');
      expect(expenseStep).toBeDefined();
      expect(expenseStep?.detail).toContain('Processed');
      expect(expenseStep?.detail).toContain('expenses');
    });
  });

  describe('Math and Rounding Utility', () => {
     it('rounds numbers correctly', () => {
       expect(roundTo(1.234, 2)).toBe(1.23);
       expect(roundTo(1.235, 2)).toBe(1.24);
       expect(roundTo(132500, 2)).toBe(132500);
       expect(roundTo(0.1 + 0.2, 2)).toBe(0.30);
     });

     it('handles negative numbers', () => {
       expect(roundTo(-1.235, 2)).toBe(-1.24);
       expect(roundTo(-0.005, 2)).toBe(-0.01);
     });

     it('handles zero', () => {
       expect(roundTo(0, 2)).toBe(0);
       expect(roundTo(0.001, 2)).toBe(0);
     });
  });

  describe('Expense Breakdown', () => {
    it('provides detailed breakdown for each expense', () => {
      const result = calculateTaxCredit(baseInput);

      expect(result.expenseBreakdown).toHaveLength(3);
      
      result.expenseBreakdown.forEach(item => {
        expect(item).toHaveProperty('expenseId');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('originalAmount');
        expect(item).toHaveProperty('cappedAmount');
        expect(item).toHaveProperty('eligiblePercentage');
        expect(item).toHaveProperty('qualifyingAmount');
        expect(item).toHaveProperty('reason');
      });
    });

    it('correctly identifies non-eligible expenses', () => {
      const result = calculateTaxCredit(baseInput);

      const softwareExpense = result.expenseBreakdown.find(e => e.type === 'software');
      expect(softwareExpense?.qualifyingAmount).toBe(0);
      expect(softwareExpense?.reason).toContain('Not flagged as R&D-related');
    });
  });
});
