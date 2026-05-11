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
var AnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const rd_classifier_service_1 = require("./rd-classifier.service");
const calculation_engine_1 = require("./calculation.engine");
let AnalysisService = AnalysisService_1 = class AnalysisService {
    prisma;
    rdClassifier;
    logger = new common_1.Logger(AnalysisService_1.name);
    constructor(prisma, rdClassifier) {
        this.prisma = prisma;
        this.rdClassifier = rdClassifier;
    }
    async assertOwnership(userId, companyId) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        if (!company)
            throw new app_exception_1.NotFoundException('Company');
        if (company.user_id !== userId)
            throw new app_exception_1.ForbiddenException();
        return company;
    }
    async runAnalysis(userId, companyId) {
        const company = await this.assertOwnership(userId, companyId);
        this.logger.log(`[AUDIT] Analysis started for company=${companyId} user=${userId} country=${company.country}`);
        this.logger.log(`[AUDIT] Step 1: Classifying projects via LLM...`);
        const classificationResults = await this.rdClassifier.classifyAllProjects(companyId);
        this.logger.log(`[AUDIT] Classification complete: ${classificationResults.length} projects processed`);
        const projects = await this.prisma.project.findMany({ where: { company_id: companyId } });
        this.logger.log(`[AUDIT] Loaded ${projects.length} projects`);
        const expenses = await this.prisma.expense.findMany({ where: { company_id: companyId } });
        this.logger.log(`[AUDIT] Loaded ${expenses.length} expenses`);
        this.logger.log(`[AUDIT] Step 3: Calculating credit for country=${company.country}`);
        const calcInput = {
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
        const calcResult = (0, calculation_engine_1.calculateTaxCredit)(calcInput);
        this.logger.log(`[AUDIT] Calculation complete: rd_score=${calcResult.companyRdScore} estimated=${calcResult.estimatedCreditAmount} rate=${calcResult.effectiveCreditRate}`);
        for (const step of calcResult.auditTrail) {
            this.logger.log(`[AUDIT][CALC] ${step.step}: ${step.detail} → ${step.value}`);
        }
        for (const warning of calcResult.sanityWarnings) {
            if (warning.severity === 'critical') {
                this.logger.error(`[SANITY_CRITICAL] ${warning.code}: ${warning.message}`);
            }
            else {
                this.logger.warn(`[SANITY_WARN] ${warning.code}: ${warning.message}`);
            }
        }
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
                details: details,
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
    async findOne(userId, companyId, runId) {
        await this.assertOwnership(userId, companyId);
        const run = await this.prisma.analysisRun.findFirst({
            where: { id: runId, company_id: companyId },
        });
        if (!run)
            throw new app_exception_1.NotFoundException('AnalysisRun');
        return run;
    }
    async findAll(userId, companyId) {
        await this.assertOwnership(userId, companyId);
        return this.prisma.analysisRun.findMany({
            where: { company_id: companyId },
            orderBy: { created_at: 'desc' },
        });
    }
};
exports.AnalysisService = AnalysisService;
exports.AnalysisService = AnalysisService = AnalysisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rd_classifier_service_1.RdClassifierService])
], AnalysisService);
//# sourceMappingURL=analysis.service.js.map