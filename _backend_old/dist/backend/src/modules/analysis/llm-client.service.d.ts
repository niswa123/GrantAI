import { ConfigService } from '@nestjs/config';
import type { PreparedPrompt } from './prompt.manager';
export interface LlmResponse<T = unknown> {
    data: T;
    model: string;
    tokensUsed: {
        prompt: number;
        completion: number;
        total: number;
    };
    latencyMs: number;
}
export declare class LlmClientService {
    private readonly config;
    private readonly logger;
    private readonly apiKey;
    private readonly baseUrl;
    private readonly maxRetries;
    constructor(config: ConfigService);
    call<T = unknown>(prompt: PreparedPrompt): Promise<LlmResponse<T>>;
}
