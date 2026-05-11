import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    create(user: JwtPayload, dto: CreateCompanyDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        country: string;
        industry: string;
        user_id: string;
    }>;
    findAll(user: JwtPayload): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        country: string;
        industry: string;
        user_id: string;
    }[]>;
    findOne(user: JwtPayload, id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        country: string;
        industry: string;
        user_id: string;
    }>;
    update(user: JwtPayload, id: string, dto: UpdateCompanyDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        country: string;
        industry: string;
        user_id: string;
    }>;
    remove(user: JwtPayload, id: string): Promise<void>;
}
