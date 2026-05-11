"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareClassifyProjectPrompt = prepareClassifyProjectPrompt;
exports.prepareClaimTextPrompt = prepareClaimTextPrompt;
exports.prepareClassifyExpensePrompt = prepareClassifyExpensePrompt;
exports.getClassifyCriteriaWeights = getClassifyCriteriaWeights;
exports.reloadPrompts = reloadPrompts;
const fs_1 = require("fs");
const path_1 = require("path");
let promptRegistry = null;
function loadPromptRegistry() {
    if (promptRegistry)
        return promptRegistry;
    const promptPath = (0, path_1.join)(process.cwd(), 'ai_core', 'prompts', 'prompts.json');
    const raw = (0, fs_1.readFileSync)(promptPath, 'utf-8');
    const parsed = JSON.parse(raw);
    promptRegistry = {};
    for (const [key, value] of Object.entries(parsed)) {
        if (key.startsWith('$') || key.startsWith('_'))
            continue;
        promptRegistry[key] = value;
    }
    return promptRegistry;
}
function prepareClassifyProjectPrompt(projectJson) {
    const config = loadPromptRegistry()['CLASSIFY_PROJECT'];
    if (!config)
        throw new Error('CLASSIFY_PROJECT prompt not found');
    return {
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.max_tokens,
        systemMessage: config.system,
        userMessage: interpolate(config.user_template, {
            project_json: JSON.stringify(projectJson, null, 2),
        }),
    };
}
function prepareClaimTextPrompt(companyJson, projectsJson, expensesJson, countryCode) {
    const config = loadPromptRegistry()['GENERATE_CLAIM_TEXT'];
    if (!config)
        throw new Error('GENERATE_CLAIM_TEXT prompt not found');
    let systemMessage = config.system;
    const countryUpper = countryCode.toUpperCase();
    if (config.country_overrides?.[countryUpper]) {
        systemMessage += config.country_overrides[countryUpper].system_suffix;
    }
    return {
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.max_tokens,
        systemMessage,
        userMessage: interpolate(config.user_template, {
            company_json: JSON.stringify(companyJson, null, 2),
            projects_json: JSON.stringify(projectsJson, null, 2),
            expenses_json: JSON.stringify(expensesJson, null, 2),
            country: countryUpper,
        }),
    };
}
function prepareClassifyExpensePrompt(expenseJson) {
    const config = loadPromptRegistry()['CLASSIFY_EXPENSE'];
    if (!config)
        throw new Error('CLASSIFY_EXPENSE prompt not found');
    return {
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.max_tokens,
        systemMessage: config.system,
        userMessage: interpolate(config.user_template, {
            expense_json: JSON.stringify(expenseJson, null, 2),
        }),
    };
}
function getClassifyCriteriaWeights() {
    const config = loadPromptRegistry()['CLASSIFY_PROJECT'];
    return config?.criteria_weights ?? {
        novelty: 0.3,
        technical_uncertainty: 0.3,
        systematic_approach: 0.15,
        transferability: 0.1,
        creative_element: 0.15,
    };
}
function reloadPrompts() {
    promptRegistry = null;
    loadPromptRegistry();
}
function interpolate(template, vars) {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
}
//# sourceMappingURL=prompt.manager.js.map