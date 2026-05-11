/**
 * LLM Client — Abstraction layer for OpenAI-compatible API calls.
 * Handles retries, exponential backoff, logging, and JSON parsing.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PreparedPrompt } from './prompt.manager';

export interface LlmResponse<T = unknown> {
  data: T;
  model: string;
  tokensUsed: { prompt: number; completion: number; total: number };
  latencyMs: number;
}

@Injectable()
export class LlmClientService {
  private readonly logger = new Logger(LlmClientService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('LLM_API_KEY', '');
    this.baseUrl = this.config.get<string>('LLM_BASE_URL', 'https://api.openai.com/v1');
    this.maxRetries = this.config.get<number>('LLM_MAX_RETRIES', 3);

    if (!this.apiKey) {
      this.logger.warn('LLM_API_KEY not set. LLM calls will fail.');
    }
  }

  async call<T = unknown>(prompt: PreparedPrompt): Promise<LlmResponse<T>> {
    const startTime = Date.now();

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`LLM call attempt ${attempt}/${this.maxRetries} — model: ${prompt.model}`);

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: prompt.model,
            temperature: prompt.temperature,
            max_tokens: prompt.maxTokens,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: prompt.systemMessage },
              { role: 'user', content: prompt.userMessage },
            ],
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`LLM API error ${response.status}: ${errorBody}`);
        }

        const result = (await response.json()) as {
          choices: Array<{ message: { content: string } }>;
          usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
          model: string;
        };

        const content = result.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty response from LLM');

        this.logger.debug(`LLM raw response: ${content.substring(0, 500)}...`);

        const parsed = JSON.parse(content) as T;
        const latencyMs = Date.now() - startTime;

        this.logger.log(`LLM call OK — ${result.usage?.total_tokens ?? '?'} tokens, ${latencyMs}ms`);

        return {
          data: parsed,
          model: result.model,
          tokensUsed: {
            prompt: result.usage?.prompt_tokens ?? 0,
            completion: result.usage?.completion_tokens ?? 0,
            total: result.usage?.total_tokens ?? 0,
          },
          latencyMs,
        };
      } catch (error) {
        this.logger.error(`LLM attempt ${attempt} failed: ${error}`);
        if (attempt === this.maxRetries) {
          throw new Error(`LLM failed after ${this.maxRetries} attempts: ${error}`);
        }
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt - 1) * 1000));
      }
    }

    throw new Error('LLM call failed: exhausted retries');
  }
}
