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
var CompanyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
let CompanyService = CompanyService_1 = class CompanyService {
    prisma;
    logger = new common_1.Logger(CompanyService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const company = await this.prisma.company.create({
            data: { ...dto, user_id: userId },
        });
        this.logger.log(`Company created: ${company.id} by user: ${userId}`);
        return company;
    }
    async findAll(userId) {
        return this.prisma.company.findMany({ where: { user_id: userId } });
    }
    async findOne(userId, companyId) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        if (!company)
            throw new app_exception_1.NotFoundException('Company');
        if (company.user_id !== userId)
            throw new app_exception_1.ForbiddenException();
        return company;
    }
    async update(userId, companyId, dto) {
        await this.findOne(userId, companyId);
        return this.prisma.company.update({ where: { id: companyId }, data: dto });
    }
    async remove(userId, companyId) {
        await this.findOne(userId, companyId);
        await this.prisma.company.delete({ where: { id: companyId } });
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = CompanyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyService);
//# sourceMappingURL=company.service.js.map