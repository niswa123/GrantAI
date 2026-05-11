"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LlmClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmClientService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let LlmClientService = LlmClientService_1 = class LlmClientService {
    config;
    logger = new common_1.Logger(LlmClientService_1.name);
    apiKey;
    baseUrl;
    maxRetries;
    constructor(config) {
        this.config = config;
        this.apiKey = this.config.get('LLM_API_KEY', '');
        this.baseUrl = this.config.get('LLM_BASE_URL', 'https://api.openai.com/v1');
        this.maxRetries = this.config.get('LLM_MAX_RETRIES', 3);
        if (!this.apiKey) {
            this.logger.warn('LLM_API_KEY not set. LLM calls will fail.');
        }
    }
    async call(prompt) {
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
                const result = (await response.json());
                const content = result.choices?.[0]?.message?.content;
                if (!content)
                    throw new Error('Empty response from LLM');
                this.logger.debug(`LLM raw response: ${content.substring(0, 500)}...`);
                const parsed = JSON.parse(content);
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
            }
            catch (error) {
                this.logger.error(`LLM attempt ${attempt} failed: ${error}`);
                if (attempt === this.maxRetries) {
                    throw new Error(`LLM failed after ${this.maxRetries} attempts: ${error}`);
                }
                await new Promise((r) => setTimeout(r, Math.pow(2, attempt - 1) * 1000));
            }
        }
        throw new Error('LLM call failed: exhausted retries');
    }
};
exports.LlmClientService = LlmClientService;
exports.LlmClientService = LlmClientService = LlmClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LlmClientService);
//# sourceMappingURL=llm-client.service.js.map