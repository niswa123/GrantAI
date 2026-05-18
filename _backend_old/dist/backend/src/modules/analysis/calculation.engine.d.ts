export interface ExpenseInput {
    id: string;
    type: string;
    amount: number;
    isRdRelated: boolean;
    description?: string;
}
export interface ProjectInput {
    id: string;
    title: string;
    rdScore: number;
    isRd: boolean;
}
export interface CalculationInput {
    countryCode: string;
    companyRevenue?: number;
    projects: ProjectInput[];
    expenses: ExpenseInput[];
}
export interface ExpenseBreakdownItem {
    expenseId: string;
    type: string;
    originalAmount: number;
    cappedAmount: number;
    eligiblePercentage: number;
    qualifyingAmount: number;
    reason: string;
}
export interface AuditStep {
    step: string;
    detail: string;
    value?: number | string;
}
export interface SanityWarning {
    code: string;
    message: string;
    severity: 'warn' | 'critical';
}
export interface CalculationResult {
    rdExpensesTotal: number;
    nonRdExpensesTotal: number;
    estimatedCreditAmount: number;
    companyRdScore: number;
    qualifyingProjectsCount: number;
    expenseBreakdown: ExpenseBreakdownItem[];
    countryCode: string;
    effectiveCreditRate: number;
    smeRateApplied: boolean;
    auditTrail: AuditStep[];
    sanityWarnings: SanityWarning[];
}
export declare function calculateTaxCredit(input: CalculationInput): CalculationResult;
export declare function roundTo(value: number, decimals: number): number;
