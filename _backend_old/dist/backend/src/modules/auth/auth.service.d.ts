import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly logger;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            email: string;
            id: string;
            created_at: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    private signToken;
}
