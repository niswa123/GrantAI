/**
 * Claims Service — R&D tax credit claim lifecycle with LLM-powered text generation.
 *
 * generate() now:
 * 1. Creates draft claim from latest analysis run
 * 2. Generates formal justification text via LLM (GENERATE_CLAIM_TEXT prompt)
 * 3. Falls back to draft status if LLM fails — no data loss
 */

import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ForbiddenException, NotFoundException, AppException } from '../../common/exceptions/app.exception';
import { LlmClientService } from '../analysis/llm-client.service';
import { prepareClaimTextPrompt } from '../analysis/prompt.manager';

interface GeneratedClaimText {
  companyOverview: string;
  projectDescriptions: Array<{
    projectTitle: string;
    objectives: string;
    methodology: string;
    technicalChallenges: string;
    outcomes: string;
  }>;
  noveltyStatement: string;
  technicalUncertaintyStatement: string;
  expenditureJustification: string;
}

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmClient: LlmClientService,
  ) {}

  private async assertOwnership(userId: string, companyId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company');
    if (company.user_id !== userId) throw new ForbiddenException();
    return company;
  }

  async getCompany(userId: string, companyId: string) {
    return this.assertOwnership(userId, companyId);
  }


  async generate(userId: string, companyId: string) {
    const company = await this.assertOwnership(userId, companyId);

    const latestRun = await this.prisma.analysisRun.findFirst({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
    });

    if (!latestRun) {
      throw new AppException(
        'PRECONDITION_FAILED',
        'ANALYSIS_REQUIRED',
        'You must run an analysis before generating a claim',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const expenses = await this.prisma.expense.findMany({
      where: { company_id: companyId, is_rd_related: true },
    });
    const rdExpensesTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const projects = await this.prisma.project.findMany({
      where: { company_id: companyId, is_rd: true },
    });

    // Generate claim text via LLM
    let generatedText: string | null = null;
    try {
      generatedText = await this.generateClaimText(company, projects, expenses);
      this.logger.log(`[AUDIT] LLM claim text generated for company=${companyId}`);
    } catch (error) {
      this.logger.error(`[AUDIT] LLM text generation failed: ${error}. Creating draft.`);
    }

    // DB transaction since we're writing the claim — CLAUDE.md: mandatory for 2+ table mutations
    const claim = await this.prisma.$transaction(async (tx) => {
      return tx.claim.create({
        data: {
          company_id: companyId,
          estimated_amount: Number(latestRun.estimated_amount),
          rd_expenses_total: rdExpensesTotal,
          status: generatedText ? 'generated' : 'draft',
          generated_text: generatedText,
        },
      });
    });

    this.logger.log(
      `[AUDIT] Claim created: ${claim.id} | status=${claim.status} | estimated=${claim.estimated_amount}`,
    );
    return claim;
  }

  private async generateClaimText(
    company: { name: string; country: string; industry: string },
    projects: Array<{ title: string; description: string; rd_score: number }>,
    expenses: Array<{ type: string; amount: unknown; currency: string }>,
  ): Promise<string> {
    const companyJson = { name: company.name, country: company.country, industry: company.industry };
    const projectsJson = projects.map((p) => ({
      title: p.title, description: p.description, rd_score: p.rd_score,
    }));

    const expenseSummary: Record<string, { total: number; count: number; currency: string }> = {};
    for (const e of expenses) {
      const t = e.type.toLowerCase();
      if (!expenseSummary[t]) expenseSummary[t] = { total: 0, count: 0, currency: e.currency };
      expenseSummary[t].total += Number(e.amount);
      expenseSummary[t].count += 1;
    }

    const prompt = prepareClaimTextPrompt(companyJson, projectsJson, expenseSummary, company.country);

    const response = await this.llmClient.call<{
      claim_text: {
        company_overview: string;
        project_descriptions: Array<{
          project_title: string; objectives: string; methodology: string;
          technical_challenges: string; outcomes: string;
        }>;
        novelty_statement: string;
        technical_uncertainty_statement: string;
        expenditure_justification: string;
      };
    }>(prompt);

    const ct = response.data.claim_text;
    const claimText: GeneratedClaimText = {
      companyOverview: ct.company_overview,
      projectDescriptions: ct.project_descriptions.map((pd) => ({
        projectTitle: pd.project_title,
        objectives: pd.objectives,
        methodology: pd.methodology,
        technicalChallenges: pd.technical_challenges,
        outcomes: pd.outcomes,
      })),
      noveltyStatement: ct.novelty_statement,
      technicalUncertaintyStatement: ct.technical_uncertainty_statement,
      expenditureJustification: ct.expenditure_justification,
    };

    return this.composeFullText(claimText);
  }

  private composeFullText(c: GeneratedClaimText): string {
    const s: string[] = [];
    s.push('# R&D Tax Credit Claim Justification\n');
    s.push('## 1. Company Overview\n', c.companyOverview);
    s.push('\n## 2. Qualifying R&D Projects\n');
    for (const pd of c.projectDescriptions) {
      s.push(`### ${pd.projectTitle}\n`);
      s.push(`**Objectives:** ${pd.objectives}\n`);
      s.push(`**Methodology:** ${pd.methodology}\n`);
      s.push(`**Technical Challenges:** ${pd.technicalChallenges}\n`);
      s.push(`**Outcomes:** ${pd.outcomes}\n`);
    }
    s.push('\n## 3. Novelty & Technological Advancement\n', c.noveltyStatement);
    s.push('\n## 4. Technical Uncertainty\n', c.technicalUncertaintyStatement);
    s.push('\n## 5. Qualifying Expenditure\n', c.expenditureJustification);
    return s.join('\n');
  }

  async findAll(userId: string, companyId: string) {
    await this.assertOwnership(userId, companyId);
    return this.prisma.claim.findMany({ where: { company_id: companyId }, orderBy: { created_at: 'desc' } });
  }

  async findOne(userId: string, companyId: string, claimId: string) {
    await this.assertOwnership(userId, companyId);
    const claim = await this.prisma.claim.findFirst({ where: { id: claimId, company_id: companyId } });
    if (!claim) throw new NotFoundException('Claim');
    return claim;
  }

  async submit(userId: string, companyId: string, claimId: string) {
    const claim = await this.findOne(userId, companyId, claimId);

    if (claim.status !== 'draft' && claim.status !== 'generated') {
      throw new AppException(
        'CONFLICT',
        'INVALID_CLAIM_STATE',
        `Cannot submit a claim in status: ${claim.status}`,
        HttpStatus.CONFLICT,
      );
    }

    const updated = await this.prisma.claim.update({
      where: { id: claimId },
      data: { status: 'submitted' },
    });

    this.logger.log(`[AUDIT] Claim submitted: ${claimId} by user=${userId}`);
    return updated;
  }
}
