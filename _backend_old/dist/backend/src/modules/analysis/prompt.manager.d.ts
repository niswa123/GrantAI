export interface PromptConfig {
    id: string;
    model: string;
    temperature: number;
    max_tokens: number;
    system: string;
    user_template: string;
    criteria_weights?: Record<string, number>;
    country_overrides?: Record<string, {
        system_suffix: string;
    }>;
}
export interface PreparedPrompt {
    model: string;
    temperature: number;
    maxTokens: number;
    systemMessage: string;
    userMessage: string;
}
export declare function prepareClassifyProjectPrompt(projectJson: object): PreparedPrompt;
export declare function prepareClaimTextPrompt(companyJson: object, projectsJson: object[], expensesJson: object, countryCode: string): PreparedPrompt;
export declare function prepareClassifyExpensePrompt(expenseJson: object): PreparedPrompt;
export declare function getClassifyCriteriaWeights(): Record<string, number>;
export declare function reloadPrompts(): void;
