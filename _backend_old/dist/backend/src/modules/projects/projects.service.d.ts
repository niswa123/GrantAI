import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
export declare class ProjectsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private assertOwnership;
    create(userId: string, companyId: string, dto: CreateProjectDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        description: string;
        is_rd: boolean;
        rd_score: number;
        company_id: string;
    }>;
    findAll(userId: string, companyId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        description: string;
        is_rd: boolean;
        rd_score: number;
        company_id: string;
    }[]>;
    findOne(userId: string, companyId: string, projectId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        description: string;
        is_rd: boolean;
        rd_score: number;
        company_id: string;
    }>;
    update(userId: string, companyId: string, projectId: string, dto: UpdateProjectDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        description: string;
        is_rd: boolean;
        rd_score: number;
        company_id: string;
    }>;
    remove(userId: string, companyId: string, projectId: string): Promise<void>;
}
