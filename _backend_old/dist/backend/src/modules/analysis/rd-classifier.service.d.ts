import { PrismaService } from '../../common/prisma/prisma.service';
import { LlmClientService } from './llm-client.service';
export interface ClassificationResult {
    projectId: string;
    rdScore: number;
    isRdEligible: boolean;
    keyInnovations: string[];
    criteriaScores: Record<string, {
        score: number;
        justification: string;
    }>;
    riskFlags: string[];
    recommendedEvidence: string[];
}
export declare class RdClassifierService {
    private readonly prisma;
    private readonly llmClient;
    private readonly logger;
    constructor(prisma: PrismaService, llmClient: LlmClientService);
    classifyProject(projectId: string): Promise<ClassificationResult>;
    classifyAllProjects(companyId: string): Promise<ClassificationResult[]>;
}
