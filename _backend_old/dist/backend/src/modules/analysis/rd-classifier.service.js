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
var RdClassifierService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdClassifierService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const llm_client_service_1 = require("./llm-client.service");
const prompt_manager_1 = require("./prompt.manager");
let RdClassifierService = RdClassifierService_1 = class RdClassifierService {
    prisma;
    llmClient;
    logger = new common_1.Logger(RdClassifierService_1.name);
    constructor(prisma, llmClient) {
        this.prisma = prisma;
        this.llmClient = llmClient;
    }
    async classifyProject(projectId) {
        this.logger.log(`Classifying project: ${projectId}`);
        const project = await this.prisma.project.findUniqueOrThrow({
            where: { id: projectId },
            include: { company: true },
        });
        const prompt = (0, prompt_manager_1.prepareClassifyProjectPrompt)({
            title: project.title,
            description: project.description,
            industry: project.company.industry,
            company_name: project.company.name,
        });
        const response = await this.llmClient.call(prompt);
        const data = response.data;
        const rdScore = Math.max(0, Math.min(1, data.rd_score ?? 0));
        const isRdEligible = rdScore >= 0.5;
        const weights = (0, prompt_manager_1.getClassifyCriteriaWeights)();
        if (data.criteria_scores) {
            let weightedSum = 0;
            for (const [criterion, weight] of Object.entries(weights)) {
                weightedSum += (data.criteria_scores[criterion]?.score ?? 0) * weight;
            }
            const deviation = Math.abs(weightedSum - rdScore);
            if (deviation > 0.15) {
                this.logger.warn(`rd_score ${rdScore} deviates ${deviation.toFixed(2)} from weighted sum ${weightedSum.toFixed(2)}`);
            }
        }
        await this.prisma.project.update({
            where: { id: projectId },
            data: { rd_score: rdScore, is_rd: isRdEligible },
        });
        this.logger.log(`Project ${projectId}: rd_score=${rdScore}, eligible=${isRdEligible}, innovations=${data.key_innovations?.length ?? 0}`);
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
    async classifyAllProjects(companyId) {
        const projects = await this.prisma.project.findMany({
            where: { company_id: companyId },
        });
        this.logger.log(`Classifying ${projects.length} projects for company ${companyId}`);
        const results = [];
        for (const project of projects) {
            try {
                results.push(await this.classifyProject(project.id));
            }
            catch (error) {
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
};
exports.RdClassifierService = RdClassifierService;
exports.RdClassifierService = RdClassifierService = RdClassifierService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_client_service_1.LlmClientService])
], RdClassifierService);
//# sourceMappingURL=rd-classifier.service.js.map