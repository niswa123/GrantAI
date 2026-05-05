import { type CalculationInput } from '../calculation.engine';
export declare const ROMASHKA_COMPANY: {
    id: string;
    user_id: string;
    name: string;
    country: string;
    industry: string;
};
export declare const ROMASHKA_PROJECTS: {
    id: string;
    company_id: string;
    title: string;
    description: string;
    is_rd: boolean;
    rd_score: number;
}[];
export declare const ROMASHKA_EXPENSES: {
    id: string;
    company_id: string;
    type: string;
    amount: number;
    currency: string;
    date: string;
    description: string;
    is_rd_related: boolean;
}[];
export declare const ROMASHKA_CALC_INPUT: CalculationInput;
export declare const ROMASHKA_EXPECTED: {
    countryCode: string;
    rdExpensesTotal: number;
    qualifyingProjectsCount: number;
    companyRdScore: number;
    smeRateApplied: boolean;
    effectiveCreditRate: number;
    estimatedCreditAmount: number;
    sanityWarningsCount: number;
};
export declare const ROMASHKA_CLASSIFY_INPUT_PROJECT1: {
    title: string;
    description: string;
    industry: string;
    company_name: string;
};
export declare const ROMASHKA_CLAIM_TEXT_INPUT: {
    company_json: {
        name: string;
        country: string;
        industry: string;
    };
    projects_json: {
        title: string;
        description: string;
        rd_score: number;
    }[];
    expenses_json: {
        salary: {
            total: number;
            count: number;
            currency: string;
        };
        contractor: {
            total: number;
            count: number;
            currency: string;
        };
        software: {
            total: number;
            count: number;
            currency: string;
        };
    };
    country: string;
};
