import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(user: JwtPayload, companyId: string, dto: CreateProjectDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        description: string;
        is_rd: boolean;
        rd_score: number;
        company_id: string;
    }>;
    findAll(user: JwtPayload, companyId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        description: string;
        is_rd: boolean;
        rd_score: number;
        company_id: string;
    }[]>;
    findOne(user: JwtPayload, companyId: string, id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        description: string;
        is_rd: boolean;
        rd_score: number;
        company_id: string;
    }>;
    update(user: JwtPayload, companyId: string, id: string, dto: UpdateProjectDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        description: string;
        is_rd: boolean;
        rd_score: number;
        company_id: string;
    }>;
    remove(user: JwtPayload, companyId: string, id: string): Promise<void>;
}
