export interface ExpenseCap {
    maxAmount: number | null;
    eligiblePercentage: number;
}
export interface TierRule {
    upTo: number | null;
    rate: number;
}
export interface CountryTaxRule {
    countryCode: string;
    countryName: string;
    programName: string;
    currency: string;
    baseCreditRate: number;
    tieredRates: TierRule[] | null;
    expenseCaps: {
        salary: ExpenseCap;
        contractor: ExpenseCap;
        materials: ExpenseCap;
        software: ExpenseCap;
        overhead: ExpenseCap;
    };
    eligibleExpenseTypes: string[];
    maxAnnualClaim: number | null;
    minRdScoreThreshold: number;
    smeEnhancedRate: number | null;
    smeRevenueThreshold: number | null;
    notes: string;
}
export declare const COUNTRY_TAX_RULES: Record<string, CountryTaxRule>;
export declare function getTaxRules(countryCode: string): CountryTaxRule;
export declare function getSupportedCountries(): string[];
