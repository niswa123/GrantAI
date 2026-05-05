import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ClaimsService } from './claims.service';
export declare class ClaimsController {
    private readonly claimsService;
    constructor(claimsService: ClaimsService);
    generate(user: JwtPayload, companyId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        company_id: string;
        estimated_amount: import("@prisma/client/runtime/library").Decimal;
        rd_expenses_total: import("@prisma/client/runtime/library").Decimal;
        status: string;
        generated_text: string | null;
    }>;
    findAll(user: JwtPayload, companyId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        company_id: string;
        estimated_amount: import("@prisma/client/runtime/library").Decimal;
        rd_expenses_total: import("@prisma/client/runtime/library").Decimal;
        status: string;
        generated_text: string | null;
    }[]>;
    findOne(user: JwtPayload, companyId: string, id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        company_id: string;
        estimated_amount: import("@prisma/client/runtime/library").Decimal;
        rd_expenses_total: import("@prisma/client/runtime/library").Decimal;
        status: string;
        generated_text: string | null;
    }>;
    submit(user: JwtPayload, companyId: string, id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        company_id: string;
        estimated_amount: import("@prisma/client/runtime/library").Decimal;
        rd_expenses_total: import("@prisma/client/runtime/library").Decimal;
        status: string;
        generated_text: string | null;
    }>;
}
