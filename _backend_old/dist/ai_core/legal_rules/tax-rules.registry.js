"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COUNTRY_TAX_RULES = void 0;
exports.getTaxRules = getTaxRules;
exports.getSupportedCountries = getSupportedCountries;
exports.COUNTRY_TAX_RULES = {
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
        notes: 'CIR: 30% on first €100M, 5% above. Overhead calculated as forfait at 43% of salary costs.',
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
        notes: 'Forschungszulage: 25% on eligible salary/contractor costs up to €2M base per category. Max benefit €1M/year.',
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
        notes: 'Fallback rule set: 20% on salary + 65% of contractors. No material/SW credits.',
    },
};
function getTaxRules(countryCode) {
    const normalized = countryCode.toUpperCase().trim();
    return exports.COUNTRY_TAX_RULES[normalized] ?? exports.COUNTRY_TAX_RULES['DEFAULT'];
}
function getSupportedCountries() {
    return Object.keys(exports.COUNTRY_TAX_RULES).filter((k) => k !== 'DEFAULT');
}
//# sourceMappingURL=tax-rules.registry.js.map