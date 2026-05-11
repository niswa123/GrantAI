import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Integration } from '@prisma/client';

export interface CreateIntegrationDto {
  companyId: string;
  provider: 'github' | 'jira';
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  metadata?: any;
}

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateIntegrationDto): Promise<Integration> {
    return this.prisma.integration.upsert({
      where: {
        company_id_provider: {
          company_id: data.companyId,
          provider: data.provider,
        },
      },
      update: {
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
        token_expires_at: data.tokenExpiresAt,
        metadata: data.metadata,
        updated_at: new Date(),
      },
      create: {
        company_id: data.companyId,
        provider: data.provider,
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
        token_expires_at: data.tokenExpiresAt,
        metadata: data.metadata,
      },
    });
  }

  async findByCompanyAndProvider(
    companyId: string,
    provider: 'github' | 'jira',
  ): Promise<Integration | null> {
    return this.prisma.integration.findUnique({
      where: {
        company_id_provider: {
          company_id: companyId,
          provider,
        },
      },
    });
  }

  async findAllByCompany(companyId: string): Promise<Integration[]> {
    return this.prisma.integration.findMany({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
    });
  }

  async delete(companyId: string, provider: 'github' | 'jira'): Promise<void> {
    const integration = await this.findByCompanyAndProvider(companyId, provider);
    if (!integration) {
      throw new NotFoundException(
        `Integration with provider ${provider} not found`,
      );
    }

    await this.prisma.integration.delete({
      where: {
        company_id_provider: {
          company_id: companyId,
          provider,
        },
      },
    });
  }

  async updateToken(
    companyId: string,
    provider: 'github' | 'jira',
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date,
  ): Promise<Integration> {
    return this.prisma.integration.update({
      where: {
        company_id_provider: {
          company_id: companyId,
          provider,
        },
      },
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt,
        updated_at: new Date(),
      },
    });
  }
}
