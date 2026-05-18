/**
 * Analysis Service — Main orchestration layer for R&D tax credit analysis.
 *
 * Coordinates:
 * 1. R&D classification of projects (via RdClassifierService → LLM)
 * 2. Tax credit calculation (via calculation.engine → country-specific rules)
 * 3. Persists AnalysisRun results with full audit trail
 *
 * Replaces hardcoded RD_CREDIT_RATE=0.2 with modular, country-aware engine.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '../../common/exceptions/app.exception';
import { RdClassifierService } from './rd-classifier.service';
import {
  calculateTaxCredit,
  type CalculationInput,
  type CalculationResult,
} from './calculation.engine';

// ─── Response Type ──────────────────────────────────────────────────────────

export interface AnalysisRunResult {
  analysisRunId: string;
  companyId: string;
  rdScore: number;
  estimatedAmount: number;
  breakdown: {
    rdExpenses: number;
    nonRdExpenses: number;
    qualifyingProjectsCount: number;
    effectiveCreditRate: number;
    smeRateApplied: boolean;
    expenseBreakdown: CalculationResult['expenseBreakdown'];
  };
  auditTrail: CalculationResult['auditTrail'];
  /** Business-logic sanity warnings — non-fatal, but require human review */
  sanityWarnings: CalculationResult['sanityWarnings'];
}

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rdClassifier: RdClassifierService,
  ) {}

  private async assertOwnership(userId: string, companyId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company');
    if (company.user_id !== userId) throw new ForbiddenException();
    return company;
  }

  /**
   * Run full R&D analysis pipeline:
   * 1. Classify all projects via LLM → rd_score per project
   * 2. Calculate tax credit using country-specific rules
   * 3. Persist AnalysisRun with full audit trail
   *
   * Every step is logged for debugging / tax authority verification.
   */
  async runAnalysis(userId: string, companyId: string): Promise<AnalysisRunResult> {
    const company = await this.assertOwnership(userId, companyId);

    this.logger.log(
      `[AUDIT] Analysis started for company=${companyId} user=${userId} country=${company.country}`,
    );

    // Step 1: Classify all projects via LLM
    this.logger.log(`[AUDIT] Step 1: Classifying projects via LLM...`);
    const classificationResults = await this.rdClassifier.classifyAllProjects(companyId);
    this.logger.log(
      `[AUDIT] Classification complete: ${classificationResults.length} projects processed`,
    );

    // Step 2: Reload fresh data after classification updated rd_scores
    const projects = await this.prisma.project.findMany({ where: { company_id: companyId } });
    this.logger.log(`[AUDIT] Loaded ${projects.length} projects`);

    const expenses = await this.prisma.expense.findMany({ where: { company_id: companyId } });
    this.logger.log(`[AUDIT] Loaded ${expenses.length} expenses`);

    // Step 3: Calculate tax credit using country-specific rules
    this.logger.log(`[AUDIT] Step 3: Calculating credit for country=${company.country}`);

    const calcInput: CalculationInput = {
      countryCode: company.country,
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        rdScore: p.rd_score,
        isRd: p.is_rd,
      })),
      expenses: expenses.map((e) => ({
        id: e.id,
        type: e.type,
        amount: Number(e.amount),
        isRdRelated: e.is_rd_related,
        description: e.description,
      })),
    };

    const calcResult = calculateTaxCredit(calcInput);

    this.logger.log(
      `[AUDIT] Calculation complete: rd_score=${calcResult.companyRdScore} estimated=${calcResult.estimatedCreditAmount} rate=${calcResult.effectiveCreditRate}`,
    );

    // Log each audit step
    for (const step of calcResult.auditTrail) {
      this.logger.log(`[AUDIT][CALC] ${step.step}: ${step.detail} → ${step.value}`);
    }

    // Log sanity warnings — critical ones go to ERROR level for monitoring dashboards
    for (const warning of calcResult.sanityWarnings) {
      if (warning.severity === 'critical') {
        this.logger.error(`[SANITY_CRITICAL] ${warning.code}: ${warning.message}`);
      } else {
        this.logger.warn(`[SANITY_WARN] ${warning.code}: ${warning.message}`);
      }
    }

    // Step 4: Persist analysis run
    const details = {
      classification: classificationResults,
      calculation: {
        rdExpensesTotal: calcResult.rdExpensesTotal,
        nonRdExpensesTotal: calcResult.nonRdExpensesTotal,
        effectiveCreditRate: calcResult.effectiveCreditRate,
        smeRateApplied: calcResult.smeRateApplied,
        expenseBreakdown: calcResult.expenseBreakdown,
      },
      sanityWarnings: calcResult.sanityWarnings,
      auditTrail: calcResult.auditTrail,
    };

    const analysisRun = await this.prisma.analysisRun.create({
      data: {
        company_id: companyId,
        rd_score: calcResult.companyRdScore,
        estimated_amount: calcResult.estimatedCreditAmount,
        details: details as unknown as Prisma.InputJsonValue,
      },
    });

    this.logger.log(`[AUDIT] AnalysisRun saved: ${analysisRun.id}`);

    return {
      analysisRunId: analysisRun.id,
      companyId,
      rdScore: calcResult.companyRdScore,
      estimatedAmount: calcResult.estimatedCreditAmount,
      breakdown: {
        rdExpenses: calcResult.rdExpensesTotal,
        nonRdExpenses: calcResult.nonRdExpensesTotal,
        qualifyingProjectsCount: calcResult.qualifyingProjectsCount,
        effectiveCreditRate: calcResult.effectiveCreditRate,
        smeRateApplied: calcResult.smeRateApplied,
        expenseBreakdown: calcResult.expenseBreakdown,
      },
      auditTrail: calcResult.auditTrail,
      sanityWarnings: calcResult.sanityWarnings,
    };
  }

  async findOne(userId: string, companyId: string, runId: string) {
    await this.assertOwnership(userId, companyId);
    const run = await this.prisma.analysisRun.findFirst({
      where: { id: runId, company_id: companyId },
    });
    if (!run) throw new NotFoundException('AnalysisRun');
    return run;
  }

  async findAll(userId: string, companyId: string) {
    await this.assertOwnership(userId, companyId);
    return this.prisma.analysisRun.findMany({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
    });
  }
}
