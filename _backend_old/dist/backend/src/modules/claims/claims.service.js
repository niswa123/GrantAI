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
var ClaimsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const llm_client_service_1 = require("../analysis/llm-client.service");
const prompt_manager_1 = require("../analysis/prompt.manager");
let ClaimsService = ClaimsService_1 = class ClaimsService {
    prisma;
    llmClient;
    logger = new common_1.Logger(ClaimsService_1.name);
    constructor(prisma, llmClient) {
        this.prisma = prisma;
        this.llmClient = llmClient;
    }
    async assertOwnership(userId, companyId) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        if (!company)
            throw new app_exception_1.NotFoundException('Company');
        if (company.user_id !== userId)
            throw new app_exception_1.ForbiddenException();
        return company;
    }
    async generate(userId, companyId) {
        const company = await this.assertOwnership(userId, companyId);
        const latestRun = await this.prisma.analysisRun.findFirst({
            where: { company_id: companyId },
            orderBy: { created_at: 'desc' },
        });
        if (!latestRun) {
            throw new app_exception_1.AppException('PRECONDITION_FAILED', 'ANALYSIS_REQUIRED', 'You must run an analysis before generating a claim', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const expenses = await this.prisma.expense.findMany({
            where: { company_id: companyId, is_rd_related: true },
        });
        const rdExpensesTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const projects = await this.prisma.project.findMany({
            where: { company_id: companyId, is_rd: true },
        });
        let generatedText = null;
        try {
            generatedText = await this.generateClaimText(company, projects, expenses);
            this.logger.log(`[AUDIT] LLM claim text generated for company=${companyId}`);
        }
        catch (error) {
            this.logger.error(`[AUDIT] LLM text generation failed: ${error}. Creating draft.`);
        }
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
        this.logger.log(`[AUDIT] Claim created: ${claim.id} | status=${claim.status} | estimated=${claim.estimated_amount}`);
        return claim;
    }
    async generateClaimText(company, projects, expenses) {
        const companyJson = { name: company.name, country: company.country, industry: company.industry };
        const projectsJson = projects.map((p) => ({
            title: p.title, description: p.description, rd_score: p.rd_score,
        }));
        const expenseSummary = {};
        for (const e of expenses) {
            const t = e.type.toLowerCase();
            if (!expenseSummary[t])
                expenseSummary[t] = { total: 0, count: 0, currency: e.currency };
            expenseSummary[t].total += Number(e.amount);
            expenseSummary[t].count += 1;
        }
        const prompt = (0, prompt_manager_1.prepareClaimTextPrompt)(companyJson, projectsJson, expenseSummary, company.country);
        const response = await this.llmClient.call(prompt);
        const ct = response.data.claim_text;
        const claimText = {
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
    composeFullText(c) {
        const s = [];
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
    async findAll(userId, companyId) {
        await this.assertOwnership(userId, companyId);
        return this.prisma.claim.findMany({ where: { company_id: companyId }, orderBy: { created_at: 'desc' } });
    }
    async findOne(userId, companyId, claimId) {
        await this.assertOwnership(userId, companyId);
        const claim = await this.prisma.claim.findFirst({ where: { id: claimId, company_id: companyId } });
        if (!claim)
            throw new app_exception_1.NotFoundException('Claim');
        return claim;
    }
    async submit(userId, companyId, claimId) {
        const claim = await this.findOne(userId, companyId, claimId);
        if (claim.status !== 'draft' && claim.status !== 'generated') {
            throw new app_exception_1.AppException('CONFLICT', 'INVALID_CLAIM_STATE', `Cannot submit a claim in status: ${claim.status}`, common_1.HttpStatus.CONFLICT);
        }
        const updated = await this.prisma.claim.update({
            where: { id: claimId },
            data: { status: 'submitted' },
        });
        this.logger.log(`[AUDIT] Claim submitted: ${claimId} by user=${userId}`);
        return updated;
    }
};
exports.ClaimsService = ClaimsService;
exports.ClaimsService = ClaimsService = ClaimsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_client_service_1.LlmClientService])
], ClaimsService);
//# sourceMappingURL=claims.service.js.map