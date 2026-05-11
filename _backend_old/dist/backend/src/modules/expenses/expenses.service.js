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
var ExpensesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const app_exception_1 = require("../../common/exceptions/app.exception");
const RD_EXPENSE_TYPES = new Set(['salary', 'contractor']);
let ExpensesService = ExpensesService_1 = class ExpensesService {
    prisma;
    logger = new common_1.Logger(ExpensesService_1.name);
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
        const is_rd_related = RD_EXPENSE_TYPES.has(dto.type);
        const expense = await this.prisma.expense.create({
            data: {
                ...dto,
                amount: dto.amount,
                date: new Date(dto.date),
                company_id: companyId,
                is_rd_related,
            },
        });
        this.logger.log(`Expense created: ${expense.id} | type=${dto.type} | is_rd_related=${is_rd_related}`);
        return expense;
    }
    async findAll(userId, companyId) {
        await this.assertOwnership(userId, companyId);
        return this.prisma.expense.findMany({ where: { company_id: companyId }, orderBy: { created_at: 'desc' } });
    }
    async remove(userId, companyId, expenseId) {
        await this.assertOwnership(userId, companyId);
        const expense = await this.prisma.expense.findFirst({ where: { id: expenseId, company_id: companyId } });
        if (!expense)
            throw new app_exception_1.NotFoundException('Expense');
        await this.prisma.expense.delete({ where: { id: expenseId } });
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = ExpensesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map