import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '../../common/exceptions/app.exception';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCompanyDto) {
    const company = await this.prisma.company.create({
      data: { ...dto, user_id: userId },
    });
    this.logger.log(`Company created: ${company.id} by user: ${userId}`);
    return company;
  }

  async findAll(userId: string) {
    return this.prisma.company.findMany({ where: { user_id: userId } });
  }

  async findOne(userId: string, companyId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company');
    if (company.user_id !== userId) throw new ForbiddenException();
    return company;
  }

  async update(userId: string, companyId: string, dto: UpdateCompanyDto) {
    await this.findOne(userId, companyId);
    return this.prisma.company.update({ where: { id: companyId }, data: dto });
  }

  async remove(userId: string, companyId: string) {
    await this.findOne(userId, companyId);
    await this.prisma.company.delete({ where: { id: companyId } });
  }
}
