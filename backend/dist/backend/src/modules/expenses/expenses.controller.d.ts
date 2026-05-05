import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/expense.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(user: JwtPayload, companyId: string, dto: CreateExpenseDto): Promise<{
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
    findAll(user: JwtPayload, companyId: string): Promise<{
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
    remove(user: JwtPayload, companyId: string, id: string): Promise<void>;
}
