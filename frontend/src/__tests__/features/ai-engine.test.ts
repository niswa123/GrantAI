import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as llmClient from '@/lib/rd-engine/llm-client';
import { runRdPipeline, formatClaimForStorage } from '@/lib/rd-engine/pipeline';
import type { PipelineResult } from '@/lib/rd-engine/pipeline';

// Mock feedback-store to avoid database or file I/O
vi.mock('@/lib/rd-engine/feedback-store', () => ({
  buildDynamicFewShotContext: vi.fn().mockResolvedValue(''),
}));

describe('KIE.AI LLM Client (llm-client.ts)', () => {
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('verifies happy path: successfully calls the API and extracts clean JSON', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({ is_rd_eligible: true, score: 0.85 }),
          },
        },
      ],
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await llmClient.callLlm<{ is_rd_eligible: boolean; score: number }>([
      { role: 'user', content: 'Test prompt' },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.is_rd_eligible).toBe(true);
    expect(result.score).toBe(0.85);
  });

  it('handles markdown-wrapped JSON blocks correctly', async () => {
    const rawContent = `
\`\`\`json
{
  "project_title": "Markdown Project",
  "success": true
}
\`\`\`
    `;
    const mockResponse = {
      choices: [{ message: { content: rawContent } }],
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await llmClient.callLlm<{ project_title: string; success: boolean }>([
      { role: 'user', content: 'Test prompt' },
    ]);

    expect(result.project_title).toBe('Markdown Project');
    expect(result.success).toBe(true);
  });

  it('extracts JSON when there is leading and trailing garbage text', async () => {
    const rawContent = `
Here is your analysis:
{
  "explanation": "Extracted despite garbage text",
  "valid": true
}
Hope it helps!
    `;
    const mockResponse = {
      choices: [{ message: { content: rawContent } }],
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await llmClient.callLlm<{ explanation: string; valid: boolean }>([
      { role: 'user', content: 'Test prompt' },
    ]);

    expect(result.explanation).toBe('Extracted despite garbage text');
    expect(result.valid).toBe(true);
  });

  it('throws PARSE_ERROR if response content is not valid JSON', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'Invalid JSON completely' } }],
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await expect(
      llmClient.callLlm([{ role: 'user', content: 'Test prompt' }])
    ).rejects.toThrow(llmClient.LlmApiError);
  });

  it('throws API_ERROR when KIE.AI returns an error object inside 200 OK', async () => {
    const mockResponse = {
      error: { message: 'Quota exceeded or invalid API Key' },
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await expect(
      llmClient.callLlm([{ role: 'user', content: 'Test prompt' }])
    ).rejects.toThrow(/Quota exceeded/);
  });

  it('implements retry logic on transient HTTP errors and eventually fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    });

    await expect(
      llmClient.callLlm([{ role: 'user', content: 'Test prompt' }])
    ).rejects.toThrow(/All 2 LLM attempts failed/);

    // Should have retried (total 2 attempts as defined by MAX_RETRIES)
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('R&D AI Pipeline Engine (pipeline.ts)', () => {
  let callLlmSpy: any;

  beforeEach(() => {
    // Spy on the exported callLlm function from llm-client
    callLlmSpy = vi.spyOn(llmClient, 'callLlm');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs runRdPipeline for a clearly eligible R&D project (Happy Path)', async () => {
    // Classification pass returns solid R&D score
    const mockClassificationResult = {
      rd_score: 0.85,
      is_rd_eligible: true,
      criteria_scores: {
        novelty: { score: 0.8, justification: 'Very novel approach' },
        technical_uncertainty: { score: 0.9, justification: 'Significant hurdles' },
        systematic_approach: { score: 0.8, justification: 'Highly methodical' },
        transferability: { score: 0.7, justification: 'Generalizable concepts' },
        creative_element: { score: 0.8, justification: 'Highly creative' },
      },
      key_innovations: ['Novel core algorithm'],
      disqualifying_factors_found: [],
      risk_flags: [],
      recommended_evidence: ['Jira tickets'],
      step_by_step_analysis: {
        '1_identify_baseline': 'Baseline state',
        '2_identify_advance': 'Technical advance',
        '3_identify_uncertainty': 'Core uncertainty',
        '4_evaluate_methodology': 'Experimental evaluation',
      },
    };

    // Pass 1b: Critique Devil's advocate agrees
    const mockCritiqueResult = {
      critique: 'Looks solid R&D.',
      agrees_with_classification: true,
      adjusted_rd_score: 0.85,
    };

    // Pass 2: Claim generation text
    const mockClaimTextResult = {
      claim_text: {
        company_overview: 'Co overview',
        project_descriptions: [
          {
            project_title: 'Core Algo',
            technological_baseline: 'Standard baseline',
            objectives: 'Objectives',
            technical_challenges: 'Challenges',
            methodology_and_iterations: 'Methodology text',
            outcomes: 'Outcomes',
          },
        ],
        technological_advancement_statement: 'Advancement',
        technological_uncertainty_statement: 'Uncertainty',
        expenditure_justification: 'Costs breakdown',
      },
      metadata: {
        total_projects_analyzed: 1,
        qualifying_projects_count: 1,
        confidence_level: 'high',
        audit_risk_warnings: [],
      },
    };

    callLlmSpy
      .mockResolvedValueOnce(mockClassificationResult) // Pass 1
      .mockResolvedValueOnce(mockCritiqueResult)       // Pass 1b (Critique runs since score >= 0.5)
      .mockResolvedValueOnce(mockClaimTextResult);     // Pass 2

    const result = await runRdPipeline({
      description: 'Developing a novel machine learning compiler...',
      salaryCosts: 200000,
      devCosts: 50000,
      countryCode: 'NL',
    });

    expect(result.classification.is_rd_eligible).toBe(true);
    expect(result.classification.rd_score).toBe(0.85);
    expect(result.claimText.claim_text.company_overview).toBe('Co overview');
    expect(callLlmSpy).toHaveBeenCalledTimes(3);
  });

  it('verifies that formatClaimForStorage serializes the Markdown correctly with embedded rich metadata', () => {
    const pipelineResult: PipelineResult = {
      classification: {
        rd_score: 0.75,
        is_rd_eligible: true,
        criteria_scores: {
          novelty: { score: 0.7, justification: 'Novel approach' },
          technical_uncertainty: { score: 0.8, justification: 'Technical unknowns' },
          systematic_approach: { score: 0.75, justification: 'Methodical' },
          transferability: { score: 0.6, justification: 'Transferable' },
          creative_element: { score: 0.7, justification: 'Creative' },
        },
        key_innovations: ['Key innovation 1'],
        disqualifying_factors_found: [],
        risk_flags: ['Audit risk flag'],
        recommended_evidence: ['Evidence documentation'],
        step_by_step_analysis: {
          '1_identify_baseline': 'Baseline text',
          '2_identify_advance': 'Advance text',
          '3_identify_uncertainty': 'Uncertainty text',
          '4_evaluate_methodology': 'Methodology evaluation',
        },
      },
      claimText: {
        claim_text: {
          company_overview: 'Company overview text.',
          project_descriptions: [
            {
              project_title: 'Quantum Compiler',
              technological_baseline: 'Standard classical baseline',
              objectives: 'Build quantum compiler',
              technical_challenges: 'Quantum decoherence',
              methodology_and_iterations: 'Multiple cryogenic tests',
              outcomes: 'Stable compiler achieved',
            },
          ],
          technological_advancement_statement: 'Achieved 20% quantum speedup.',
          technological_uncertainty_statement: 'Overcame quantum noise limits.',
          expenditure_justification: 'Salary is linked to cryogenic testing.',
        },
        metadata: {
          total_projects_analyzed: 1,
          qualifying_projects_count: 1,
          confidence_level: 'high',
          audit_risk_warnings: [],
        },
      },
      latencyMs: 120,
    };

    const formatted = formatClaimForStorage(pipelineResult);

    // Verify company overview rendering
    expect(formatted).toContain('## Company Overview');
    expect(formatted).toContain('Company overview text.');

    // Verify project description rendering
    expect(formatted).toContain('## Project: Quantum Compiler');
    expect(formatted).toContain('**Technological Baseline**');
    expect(formatted).toContain('Standard classical baseline');

    // Verify metadata embedding comment is present
    expect(formatted).toContain('<!-- GRANT_AI_METADATA:');
    
    // Verify JSON within metadata block is correct and parseable
    const match = formatted.match(/<!-- GRANT_AI_METADATA: ([\s\S]*?) -->/);
    expect(match).not.toBeNull();
    const parsed = JSON.parse(match![1]);
    expect(parsed.keyInnovations).toContain('Key innovation 1');
    expect(parsed.riskFlags).toContain('Audit risk flag');
    expect(parsed.recommendedEvidence).toContain('Evidence documentation');
  });
});
