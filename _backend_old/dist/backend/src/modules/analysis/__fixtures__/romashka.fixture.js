"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROMASHKA_CLAIM_TEXT_INPUT = exports.ROMASHKA_CLASSIFY_INPUT_PROJECT1 = exports.ROMASHKA_EXPECTED = exports.ROMASHKA_CALC_INPUT = exports.ROMASHKA_EXPENSES = exports.ROMASHKA_PROJECTS = exports.ROMASHKA_COMPANY = void 0;
exports.ROMASHKA_COMPANY = {
    id: 'test-company-romashka-001',
    user_id: 'test-user-001',
    name: 'Romashka LLC',
    country: 'NL',
    industry: 'Information Technology',
};
exports.ROMASHKA_PROJECTS = [
    {
        id: 'test-project-001',
        company_id: 'test-company-romashka-001',
        title: 'AI-powered Document Classifier',
        description: 'Development of a custom NLP model to automatically categorize legal documents. ' +
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
        description: 'Engineering a modular, country-agnostic calculation engine for R&D tax credits. ' +
            'Technical challenges include: handling floating-point precision in multi-currency ' +
            'scenarios, designing a tiered-rate system that is provably correct under all edge cases, ' +
            'and creating a zero-hardcode architecture that allows new jurisdictions to be added ' +
            'without modifying core business logic. This required novel algorithmic design.',
        is_rd: true,
        rd_score: 0.78,
    },
];
exports.ROMASHKA_EXPENSES = [
    {
        id: 'test-expense-001',
        company_id: 'test-company-romashka-001',
        type: 'salary',
        amount: 32500,
        currency: 'EUR',
        date: '2024-01-01',
        description: 'Salary costs for 2 ML engineers working on document classifier (Project 1)',
        is_rd_related: true,
    },
    {
        id: 'test-expense-002',
        company_id: 'test-company-romashka-001',
        type: 'contractor',
        amount: 12000,
        currency: 'EUR',
        date: '2024-03-15',
        description: 'External NLP specialist for transformer model architecture review',
        is_rd_related: true,
    },
    {
        id: 'test-expense-003',
        company_id: 'test-company-romashka-001',
        type: 'software',
        amount: 3500,
        currency: 'EUR',
        date: '2024-02-01',
        description: 'AWS GPU instances for model training (not eligible in NL WBSO)',
        is_rd_related: true,
    },
    {
        id: 'test-expense-004',
        company_id: 'test-company-romashka-001',
        type: 'salary',
        amount: 2000,
        currency: 'EUR',
        date: '2024-04-01',
        description: 'Backend developer time on tax calculation engine (Project 2)',
        is_rd_related: true,
    },
];
exports.ROMASHKA_CALC_INPUT = {
    countryCode: 'NL',
    companyRevenue: 280_000,
    projects: exports.ROMASHKA_PROJECTS.map((p) => ({
        id: p.id,
        title: p.title,
        rdScore: p.rd_score,
        isRd: p.is_rd,
    })),
    expenses: exports.ROMASHKA_EXPENSES.map((e) => ({
        id: e.id,
        type: e.type,
        amount: e.amount,
        isRdRelated: e.is_rd_related,
        description: e.description,
    })),
};
exports.ROMASHKA_EXPECTED = {
    countryCode: 'NL',
    rdExpensesTotal: 46550,
    qualifyingProjectsCount: 2,
    companyRdScore: 0.815,
    smeRateApplied: true,
    effectiveCreditRate: 0.40,
    estimatedCreditAmount: 18620,
    sanityWarningsCount: 0,
};
exports.ROMASHKA_CLASSIFY_INPUT_PROJECT1 = {
    title: 'AI-powered Document Classifier',
    description: exports.ROMASHKA_PROJECTS[0].description,
    industry: 'Information Technology',
    company_name: 'Romashka LLC',
};
exports.ROMASHKA_CLAIM_TEXT_INPUT = {
    company_json: {
        name: 'Romashka LLC',
        country: 'NL',
        industry: 'Information Technology',
    },
    projects_json: [
        {
            title: 'AI-powered Document Classifier',
            description: exports.ROMASHKA_PROJECTS[0].description,
            rd_score: 0.85,
        },
        {
            title: 'Real-time Tax Credit Calculation Engine',
            description: exports.ROMASHKA_PROJECTS[1].description,
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
//# sourceMappingURL=romashka.fixture.js.map