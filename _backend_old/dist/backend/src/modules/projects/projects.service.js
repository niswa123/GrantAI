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
var ProjectsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const RD_KEYWORDS = ['algorithm', 'ai', 'system', 'platform', 'data', 'model', 'machine learning', 'neural', 'automation'];
function classifyProject(description) {
    const lower = description.toLowerCase();
    const matchCount = RD_KEYWORDS.filter((kw) => lower.includes(kw)).length;
    if (matchCount === 0) {
        return { is_rd: false, rd_score: +(Math.random() * 0.2 + 0.1).toFixed(2) };
    }
    const score = Math.min(0.9, 0.6 + matchCount * 0.05);
    return { is_rd: true, rd_score: +score.toFixed(2) };
}
let ProjectsService = ProjectsService_1 = class ProjectsService {
    prisma;
    logger = new common_1.Logger(ProjectsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertOwnership(userId, companyId) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        if (!company)
            throw new app_exception_1.NotFoundException('Company');
        if (company.user_id !== userId)
            throw new app_exception_1.ForbiddenException();
    }
    async create(userId, companyId, dto) {
        await this.assertOwnership(userId, companyId);
        const { is_rd, rd_score } = classifyProject(dto.description);
        const project = await this.prisma.project.create({
            data: { ...dto, company_id: companyId, is_rd, rd_score },
        });
        this.logger.log(`Project created: ${project.id} | is_rd=${is_rd} | score=${rd_score}`);
        return project;
    }
    async findAll(userId, companyId) {
        await this.assertOwnership(userId, companyId);
        return this.prisma.project.findMany({ where: { company_id: companyId } });
    }
    async findOne(userId, companyId, projectId) {
        await this.assertOwnership(userId, companyId);
        const project = await this.prisma.project.findFirst({ where: { id: projectId, company_id: companyId } });
        if (!project)
            throw new app_exception_1.NotFoundException('Project');
        return project;
    }
    async update(userId, companyId, projectId, dto) {
        const project = await this.findOne(userId, companyId, projectId);
        const updates = { ...dto };
        if (dto.description) {
            const classification = classifyProject(dto.description);
            updates.is_rd = classification.is_rd;
            updates.rd_score = classification.rd_score;
        }
        return this.prisma.project.update({ where: { id: projectId }, data: updates });
    }
    async remove(userId, companyId, projectId) {
        await this.findOne(userId, companyId, projectId);
        await this.prisma.project.delete({ where: { id: projectId } });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = ProjectsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map