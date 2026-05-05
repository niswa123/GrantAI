import { PrismaService } from '../../common/prisma/prisma.service';
import { LlmClientService } from '../analysis/llm-client.service';
export declare class ClaimsService {
    private readonly prisma;
    private readonly llmClient;
    private readonly logger;
    constructor(prisma: PrismaService, llmClient: LlmClientService);
    private assertOwnership;
    generate(userId: string, companyId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        company_id: string;
        estimated_amount: import("@prisma/client/runtime/library").Decimal;
        rd_expenses_total: import("@prisma/client/runtime/library").Decimal;
        status: string;
        generated_text: string | null;
    }>;
    private generateClaimText;
    private composeFullText;
    findAll(userId: string, companyId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        company_id: string;
        estimated_amount: import("@prisma/client/runtime/library").Decimal;
        rd_expenses_total: import("@prisma/client/runtime/library").Decimal;
        status: string;
        generated_text: string | null;
    }[]>;
    findOne(userId: string, companyId: string, claimId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        company_id: string;
        estimated_amount: import("@prisma/client/runtime/library").Decimal;
        rd_expenses_total: import("@prisma/client/runtime/library").Decimal;
        status: string;
        generated_text: string | null;
    }>;
    submit(userId: string, companyId: string, claimId: string): Promise<{
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
