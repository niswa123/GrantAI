import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConflictException, AppException } from '../../common/exceptions/app.exception';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { HttpStatus } from '@nestjs/common';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: { email: dto.email, password_hash },
      select: { id: true, email: true, created_at: true },
    });

    this.logger.log(`User registered: ${user.email}`);

    const access_token = this.signToken(user.id, user.email);
    return { access_token, user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) {
      throw new AppException('UNAUTHORIZED', 'INVALID_CREDENTIALS', 'Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) {
      throw new AppException('UNAUTHORIZED', 'INVALID_CREDENTIALS', 'Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    this.logger.log(`User logged in: ${user.email}`);

    const access_token = this.signToken(user.id, user.email);
    return { access_token };
  }

  private signToken(userId: string, email: string): string {
    return this.jwt.sign({ sub: userId, email });
  }
}
