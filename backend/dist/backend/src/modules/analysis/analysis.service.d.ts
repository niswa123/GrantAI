import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RdClassifierService } from './rd-classifier.service';
import { type CalculationResult } from './calculation.engine';
export interface AnalysisRunResult {
    analysisRunId: string;
    companyId: string;
    rdScore: number;
    estimatedAmount: number;
    breakdown: {
        rdExpenses: number;
        nonRdExpenses: number;
        qualifyingProjectsCount: number;
        effectiveCreditRate: number;
        smeRateApplied: boolean;
        expenseBreakdown: CalculationResult['expenseBreakdown'];
    };
    auditTrail: CalculationResult['auditTrail'];
    sanityWarnings: CalculationResult['sanityWarnings'];
}
export declare class AnalysisService {
    private readonly prisma;
    private readonly rdClassifier;
    private readonly logger;
    constructor(prisma: PrismaService, rdClassifier: RdClassifierService);
    private assertOwnership;
    runAnalysis(userId: string, companyId: string): Promise<AnalysisRunResult>;
    findOne(userId: string, companyId: string, runId: string): Promise<{
        id: string;
        created_at: Date;
        rd_score: number;
        company_id: string;
        estimated_amount: Prisma.Decimal;
        details: Prisma.JsonValue;
    }>;
    findAll(userId: string, companyId: string): Promise<{
        id: string;
        created_at: Date;
        rd_score: number;
        company_id: string;
        estimated_amount: Prisma.Decimal;
        details: Prisma.JsonValue;
    }[]>;
}
