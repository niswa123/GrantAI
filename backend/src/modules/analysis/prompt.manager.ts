/**
 * LLM Prompt Manager — Loads, interpolates, and manages prompts from prompts.json.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PromptConfig {
  id: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system: string;
  user_template: string;
  criteria_weights?: Record<string, number>;
  country_overrides?: Record<string, { system_suffix: string }>;
}

export interface PreparedPrompt {
  model: string;
  temperature: number;
  maxTokens: number;
  systemMessage: string;
  userMessage: string;
}

// ─── Prompt Registry ────────────────────────────────────────────────────────

let promptRegistry: Record<string, PromptConfig> | null = null;

function loadPromptRegistry(): Record<string, PromptConfig> {
  if (promptRegistry) return promptRegistry;

  // Resolve relative to project root (process.cwd()) — works in both ts-node and compiled dist/
  const promptPath = join(__dirname, 'prompts.json');

  const raw = readFileSync(promptPath, 'utf-8');
  const parsed = JSON.parse(raw);

  promptRegistry = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (key.startsWith('$') || key.startsWith('_')) continue;
    promptRegistry[key] = value as PromptConfig;
  }

  return promptRegistry;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function prepareClassifyProjectPrompt(projectJson: object): PreparedPrompt {
  const config = loadPromptRegistry()['CLASSIFY_PROJECT'];
  if (!config) throw new Error('CLASSIFY_PROJECT prompt not found');

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

export function prepareClaimTextPrompt(
  companyJson: object,
  projectsJson: object[],
  expensesJson: object,
  countryCode: string,
): PreparedPrompt {
  const config = loadPromptRegistry()['GENERATE_CLAIM_TEXT'];
  if (!config) throw new Error('GENERATE_CLAIM_TEXT prompt not found');

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

export function prepareClassifyExpensePrompt(expenseJson: object): PreparedPrompt {
  const config = loadPromptRegistry()['CLASSIFY_EXPENSE'];
  if (!config) throw new Error('CLASSIFY_EXPENSE prompt not found');

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

export function getClassifyCriteriaWeights(): Record<string, number> {
  const config = loadPromptRegistry()['CLASSIFY_PROJECT'];
  return config?.criteria_weights ?? {
    novelty: 0.3,
    technical_uncertainty: 0.3,
    systematic_approach: 0.15,
    transferability: 0.1,
    creative_element: 0.15,
  };
}

export function reloadPrompts(): void {
  promptRegistry = null;
  loadPromptRegistry();
}

// ─── Internals ──────────────────────────────────────────────────────────────

function interpolate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}
