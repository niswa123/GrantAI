/**
 * R&D Classifier Service — Orchestrates LLM-based project classification.
 * Calls LLM with CLASSIFY_PROJECT prompt, validates response, persists rd_score.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LlmClientService } from './llm-client.service';
import { prepareClassifyProjectPrompt, getClassifyCriteriaWeights } from './prompt.manager';

export interface ClassificationResult {
  projectId: string;
  rdScore: number;
  isRdEligible: boolean;
  keyInnovations: string[];
  criteriaScores: Record<string, { score: number; justification: string }>;
  riskFlags: string[];
  recommendedEvidence: string[];
}

@Injectable()
export class RdClassifierService {
  private readonly logger = new Logger(RdClassifierService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmClient: LlmClientService,
  ) {}

  async classifyProject(projectId: string): Promise<ClassificationResult> {
    this.logger.log(`Classifying project: ${projectId}`);

    const project = await this.prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      include: { company: true },
    });

    const prompt = prepareClassifyProjectPrompt({
      title: project.title,
      description: project.description,
      industry: project.company.industry,
      company_name: project.company.name,
    });

    const response = await this.llmClient.call<{
      rd_score: number;
      is_rd_eligible: boolean;
      criteria_scores: Record<string, { score: number; justification: string }>;
      key_innovations: string[];
      risk_flags: string[];
      recommended_evidence: string[];
    }>(prompt);

    const data = response.data;
    const rdScore = Math.max(0, Math.min(1, data.rd_score ?? 0));
    const isRdEligible = rdScore >= 0.5;

    // Sanity check: verify LLM score vs weighted criteria
    const weights = getClassifyCriteriaWeights();
    if (data.criteria_scores) {
      let weightedSum = 0;
      for (const [criterion, weight] of Object.entries(weights)) {
        weightedSum += (data.criteria_scores[criterion]?.score ?? 0) * weight;
      }
      const deviation = Math.abs(weightedSum - rdScore);
      if (deviation > 0.15) {
        this.logger.warn(
          `rd_score ${rdScore} deviates ${deviation.toFixed(2)} from weighted sum ${weightedSum.toFixed(2)}`,
        );
      }
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: { rd_score: rdScore, is_rd: isRdEligible },
    });

    this.logger.log(
      `Project ${projectId}: rd_score=${rdScore}, eligible=${isRdEligible}, innovations=${data.key_innovations?.length ?? 0}`,
    );

    return {
      projectId,
      rdScore,
      isRdEligible,
      keyInnovations: data.key_innovations ?? [],
      criteriaScores: data.criteria_scores ?? {},
      riskFlags: data.risk_flags ?? [],
      recommendedEvidence: data.recommended_evidence ?? [],
    };
  }

  async classifyAllProjects(companyId: string): Promise<ClassificationResult[]> {
    const projects = await this.prisma.project.findMany({
      where: { company_id: companyId },
    });

    this.logger.log(`Classifying ${projects.length} projects for company ${companyId}`);
    const results: ClassificationResult[] = [];

    for (const project of projects) {
      try {
        results.push(await this.classifyProject(project.id));
      } catch (error) {
        this.logger.error(`Failed to classify project ${project.id}: ${error}`);
        results.push({
          projectId: project.id,
          rdScore: 0,
          isRdEligible: false,
          keyInnovations: [],
          criteriaScores: {},
          riskFlags: [`Classification failed: ${error}`],
          recommendedEvidence: [],
        });
      }
    }

    return results;
  }
}
