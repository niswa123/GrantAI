import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
export declare class CompanyService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateCompanyDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        country: string;
        industry: string;
        user_id: string;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        country: string;
        industry: string;
        user_id: string;
    }[]>;
    findOne(userId: string, companyId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        country: string;
        industry: string;
        user_id: string;
    }>;
    update(userId: string, companyId: string, dto: UpdateCompanyDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        country: string;
        industry: string;
        user_id: string;
    }>;
    remove(userId: string, companyId: string): Promise<void>;
}
