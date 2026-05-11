import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateExpenseDto } from './dto/expense.dto';
export declare class ExpensesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private assertOwnership;
    create(userId: string, companyId: string, dto: CreateExpenseDto): Promise<{
        type: string;
        id: string;
        created_at: Date;
        description: string;
        company_id: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        date: Date;
        is_rd_related: boolean;
    }>;
    findAll(userId: string, companyId: string): Promise<{
        type: string;
        id: string;
        created_at: Date;
        description: string;
        company_id: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        date: Date;
        is_rd_related: boolean;
    }[]>;
    remove(userId: string, companyId: string, expenseId: string): Promise<void>;
}
