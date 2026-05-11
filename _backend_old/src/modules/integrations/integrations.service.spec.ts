import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('IntegrationsService', () => {
  let service: IntegrationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    integration: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<IntegrationsService>(IntegrationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new integration', async () => {
      const mockIntegration = {
        id: '123',
        company_id: 'company-123',
        provider: 'github',
        access_token: 'token-123',
        refresh_token: null,
        token_expires_at: null,
        metadata: { username: 'testuser' },
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.integration.upsert.mockResolvedValue(mockIntegration);

      const result = await service.create({
        companyId: 'company-123',
        provider: 'github',
        accessToken: 'token-123',
        metadata: { username: 'testuser' },
      });

      expect(result).toEqual(mockIntegration);
      expect(mockPrismaService.integration.upsert).toHaveBeenCalledWith({
        where: {
          company_id_provider: {
            company_id: 'company-123',
            provider: 'github',
          },
        },
        update: expect.any(Object),
        create: expect.any(Object),
      });
    });
  });

  describe('findByCompanyAndProvider', () => {
    it('should find an integration by company and provider', async () => {
      const mockIntegration = {
        id: '123',
        company_id: 'company-123',
        provider: 'github',
        access_token: 'token-123',
        refresh_token: null,
        token_expires_at: null,
        metadata: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.integration.findUnique.mockResolvedValue(
        mockIntegration,
      );

      const result = await service.findByCompanyAndProvider(
        'company-123',
        'github',
      );

      expect(result).toEqual(mockIntegration);
      expect(mockPrismaService.integration.findUnique).toHaveBeenCalledWith({
        where: {
          company_id_provider: {
            company_id: 'company-123',
            provider: 'github',
          },
        },
      });
    });

    it('should return null if integration not found', async () => {
      mockPrismaService.integration.findUnique.mockResolvedValue(null);

      const result = await service.findByCompanyAndProvider(
        'company-123',
        'github',
      );

      expect(result).toBeNull();
    });
  });

  describe('findAllByCompany', () => {
    it('should find all integrations for a company', async () => {
      const mockIntegrations = [
        {
          id: '123',
          company_id: 'company-123',
          provider: 'github',
          access_token: 'token-123',
          refresh_token: null,
          token_expires_at: null,
          metadata: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '456',
          company_id: 'company-123',
          provider: 'jira',
          access_token: 'token-456',
          refresh_token: 'refresh-456',
          token_expires_at: new Date(),
          metadata: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPrismaService.integration.findMany.mockResolvedValue(
        mockIntegrations,
      );

      const result = await service.findAllByCompany('company-123');

      expect(result).toEqual(mockIntegrations);
      expect(mockPrismaService.integration.findMany).toHaveBeenCalledWith({
        where: { company_id: 'company-123' },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('delete', () => {
    it('should delete an integration', async () => {
      const mockIntegration = {
        id: '123',
        company_id: 'company-123',
        provider: 'github',
        access_token: 'token-123',
        refresh_token: null,
        token_expires_at: null,
        metadata: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.integration.findUnique.mockResolvedValue(
        mockIntegration,
      );
      mockPrismaService.integration.delete.mockResolvedValue(mockIntegration);

      await service.delete('company-123', 'github');

      expect(mockPrismaService.integration.delete).toHaveBeenCalledWith({
        where: {
          company_id_provider: {
            company_id: 'company-123',
            provider: 'github',
          },
        },
      });
    });

    it('should throw NotFoundException if integration not found', async () => {
      mockPrismaService.integration.findUnique.mockResolvedValue(null);

      await expect(service.delete('company-123', 'github')).rejects.toThrow(
        'Integration with provider github not found',
      );
    });
  });

  describe('updateToken', () => {
    it('should update integration token', async () => {
      const mockIntegration = {
        id: '123',
        company_id: 'company-123',
        provider: 'jira',
        access_token: 'new-token-123',
        refresh_token: 'new-refresh-123',
        token_expires_at: new Date(),
        metadata: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.integration.update.mockResolvedValue(mockIntegration);

      const result = await service.updateToken(
        'company-123',
        'jira',
        'new-token-123',
        'new-refresh-123',
        new Date(),
      );

      expect(result).toEqual(mockIntegration);
      expect(mockPrismaService.integration.update).toHaveBeenCalledWith({
        where: {
          company_id_provider: {
            company_id: 'company-123',
            provider: 'jira',
          },
        },
        data: expect.objectContaining({
          access_token: 'new-token-123',
          refresh_token: 'new-refresh-123',
        }),
      });
    });
  });
});
