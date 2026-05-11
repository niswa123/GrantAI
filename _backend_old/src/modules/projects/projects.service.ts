import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '../../common/exceptions/app.exception';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

// R&D keyword classifier – configurable keywords from tz.txt section 5.1
const RD_KEYWORDS = ['algorithm', 'ai', 'system', 'platform', 'data', 'model', 'machine learning', 'neural', 'automation'];

function classifyProject(description: string): { is_rd: boolean; rd_score: number } {
  const lower = description.toLowerCase();
  const matchCount = RD_KEYWORDS.filter((kw) => lower.includes(kw)).length;

  if (matchCount === 0) {
    return { is_rd: false, rd_score: +(Math.random() * 0.2 + 0.1).toFixed(2) };
  }

  const score = Math.min(0.9, 0.6 + matchCount * 0.05);
  return { is_rd: true, rd_score: +score.toFixed(2) };
}

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async assertOwnership(userId: string, companyId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company');
    if (company.user_id !== userId) throw new ForbiddenException();
  }

  async create(userId: string, companyId: string, dto: CreateProjectDto) {
    await this.assertOwnership(userId, companyId);
    const { is_rd, rd_score } = classifyProject(dto.description);

    const project = await this.prisma.project.create({
      data: { ...dto, company_id: companyId, is_rd, rd_score },
    });

    this.logger.log(`Project created: ${project.id} | is_rd=${is_rd} | score=${rd_score}`);
    return project;
  }

  async findAll(userId: string, companyId: string) {
    await this.assertOwnership(userId, companyId);
    return this.prisma.project.findMany({ where: { company_id: companyId } });
  }

  async findOne(userId: string, companyId: string, projectId: string) {
    await this.assertOwnership(userId, companyId);
    const project = await this.prisma.project.findFirst({ where: { id: projectId, company_id: companyId } });
    if (!project) throw new NotFoundException('Project');
    return project;
  }

  async update(userId: string, companyId: string, projectId: string, dto: UpdateProjectDto) {
    const project = await this.findOne(userId, companyId, projectId);

    // Re-classify only if description changed
    const updates: Partial<typeof project> & { is_rd?: boolean; rd_score?: number } = { ...dto };
    if (dto.description) {
      const classification = classifyProject(dto.description);
      updates.is_rd = classification.is_rd;
      updates.rd_score = classification.rd_score;
    }

    return this.prisma.project.update({ where: { id: projectId }, data: updates });
  }

  async remove(userId: string, companyId: string, projectId: string) {
    await this.findOne(userId, companyId, projectId);
    await this.prisma.project.delete({ where: { id: projectId } });
  }
}
