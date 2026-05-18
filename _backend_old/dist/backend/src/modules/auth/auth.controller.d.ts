import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
}
