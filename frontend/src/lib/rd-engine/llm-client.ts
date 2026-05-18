/**
 * LLM Client — Thin, validated wrapper around the KIE.AI API.
 *
 * Features:
 * - Retry logic with exponential backoff (3 attempts)
 * - JSON extraction with fallback parsing (handles markdown-wrapped JSON)
 * - Structured error types
 * - Timeout guard (30s)
 */

const KIE_API_URL = "https://api.kie.ai/gemini-3-flash/v1/chat/completions";
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;
const TIMEOUT_MS = 15_000;

export class LlmApiError extends Error {
  constructor(
    public readonly code:
      | "TIMEOUT"
      | "PARSE_ERROR"
      | "API_ERROR"
      | "INVALID_RESPONSE",
    message: string,
    public readonly rawResponse?: string
  ) {
    super(message);
    this.name = "LlmApiError";
  }
}

interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LlmCallOptions {
  temperature?: number;
  max_tokens?: number;
}

/**
 * Call the LLM API and return the parsed JSON response.
 * Retries on transient failures with exponential backoff.
 */
export async function callLlm<T>(
  messages: LlmMessage[],
  options: LlmCallOptions = {}
): Promise<T> {
  const { temperature = 0.1, max_tokens = 4096 } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(KIE_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.KIE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          temperature,
          max_tokens,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new LlmApiError(
          "API_ERROR",
          `API returned ${response.status}: ${body}`,
          body
        );
      }

      const data = await response.json();
      const content: string = data?.choices?.[0]?.message?.content ?? "";

      if (!content) {
        throw new LlmApiError("INVALID_RESPONSE", "Empty content in LLM response", JSON.stringify(data));
      }

      return extractJson<T>(content);
    } catch (err) {
      if (err instanceof LlmApiError && err.code === "PARSE_ERROR") {
        // Log the raw response so we can debug what the model actually returned
        console.error("[LLM] PARSE_ERROR — raw response:", err.rawResponse?.slice(0, 2000));
        // Don't retry parse errors — same prompt will produce same bad output
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`[LLM] Attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
        await sleep(delay);
      }
    }
  }

  throw new LlmApiError("API_ERROR", `All ${MAX_RETRIES} LLM attempts failed: ${lastError?.message}`);
}

/**
 * Extract JSON from LLM output — handles markdown code blocks and leading/trailing text.
 */
function extractJson<T>(raw: string): T {
  const cleaned = raw.trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Try extracting from markdown code block ```json ... ```
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim()) as T;
      } catch {
        // fall through
      }
    }

    // Try finding first { and last }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
      } catch {
        // fall through
      }
    }

    throw new LlmApiError(
      "PARSE_ERROR",
      "Failed to extract valid JSON from LLM response",
      raw
    );
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
