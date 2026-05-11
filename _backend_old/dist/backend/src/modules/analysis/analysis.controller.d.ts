import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { AnalysisService } from './analysis.service';
export declare class AnalysisController {
    private readonly analysisService;
    constructor(analysisService: AnalysisService);
    run(user: JwtPayload, companyId: string): Promise<import("./analysis.service").AnalysisRunResult>;
    findAll(user: JwtPayload, companyId: string): Promise<{
        id: string;
        created_at: Date;
        rd_score: number;
        company_id: string;
        estimated_amount: import("@prisma/client/runtime/library").Decimal;
        details: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    findOne(user: JwtPayload, companyId: string, id: string): Promise<{
        id: string;
        created_at: Date;
        rd_score: number;
        company_id: string;
        estimated_amount: import("@prisma/client/runtime/library").Decimal;
        details: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
