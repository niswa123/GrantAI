import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '../../common/exceptions/app.exception';
import { CreateExpenseDto } from './dto/expense.dto';

// R&D related expense types per tz.txt section 5.2
const RD_EXPENSE_TYPES = new Set(['salary', 'contractor']);

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async assertOwnership(userId: string, companyId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company');
    if (company.user_id !== userId) throw new ForbiddenException();
  }

  async create(userId: string, companyId: string, dto: CreateExpenseDto) {
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

  async findAll(userId: string, companyId: string) {
    await this.assertOwnership(userId, companyId);
    return this.prisma.expense.findMany({ where: { company_id: companyId }, orderBy: { created_at: 'desc' } });
  }

  async remove(userId: string, companyId: string, expenseId: string) {
    await this.assertOwnership(userId, companyId);
    const expense = await this.prisma.expense.findFirst({ where: { id: expenseId, company_id: companyId } });
    if (!expense) throw new NotFoundException('Expense');
    await this.prisma.expense.delete({ where: { id: expenseId } });
  }
}
