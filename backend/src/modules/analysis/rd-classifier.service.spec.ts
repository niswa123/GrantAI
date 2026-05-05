import { Test, TestingModule } from '@nestjs/testing';
import { RdClassifierService } from './rd-classifier.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LlmClientService } from './llm-client.service';

describe('RdClassifierService', () => {
  let service: RdClassifierService;
  let prismaService: PrismaService;
  let llmClientService: LlmClientService;

  const mockProject = {
    id: 'project-123',
    title: 'AI-Powered Recommendation Engine',
    description: 'Developing a novel machine learning algorithm for personalized recommendations',
    rd_score: 0,
    is_rd: false,
    company_id: 'company-123',
    created_at: new Date(),
    updated_at: new Date(),
    company: {
      id: 'company-123',
      name: 'Tech Innovations Inc',
      industry: 'Software',
      country: 'US',
      revenue: 1000000,
      user_id: 'user-123',
      created_at: new Date(),
      updated_at: new Date(),
    },
  };

  const mockLlmResponse = {
    data: {
      rd_score: 0.85,
      is_rd_eligible: true,
      criteria_scores: {
        technical_uncertainty: { score: 0.9, justification: 'Novel ML algorithm with uncertain outcomes' },
        systematic_approach: { score: 0.8, justification: 'Structured development methodology' },
        technological_advancement: { score: 0.85, justification: 'Advances state-of-the-art in recommendations' },
      },
      key_innovations: [
        'Novel neural network architecture',
        'Real-time personalization algorithm',
        'Scalable distributed training system',
      ],
      risk_flags: [],
      recommended_evidence: [
        'Technical design documents',
        'Algorithm performance benchmarks',
        'Research papers or citations',
      ],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RdClassifierService,
        {
          provide: PrismaService,
          useValue: {
            project: {
              findUniqueOrThrow: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: LlmClientService,
          useValue: {
            call: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RdClassifierService>(RdClassifierService);
    prismaService = module.get<PrismaService>(PrismaService);
    llmClientService = module.get<LlmClientService>(LlmClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('classifyProject', () => {
    it('should successfully classify a high R&D score project', async () => {
      jest.spyOn(prismaService.project, 'findUniqueOrThrow').mockResolvedValue(mockProject);
      jest.spyOn(llmClientService, 'call').mockResolvedValue(mockLlmResponse);
      jest.spyOn(prismaService.project, 'update').mockResolvedValue({
        ...mockProject,
        rd_score: 0.85,
        is_rd: true,
      });

      const result = await service.classifyProject('project-123');

      expect(result.projectId).toBe('project-123');
      expect(result.rdScore).toBe(0.85);
      expect(result.isRdEligible).toBe(true);
      expect(result.keyInnovations).toHaveLength(3);
      expect(result.criteriaScores).toHaveProperty('technical_uncertainty');
      expect(result.riskFlags).toHaveLength(0);
      expect(result.recommendedEvidence).toHaveLength(3);

      expect(prismaService.project.update).toHaveBeenCalledWith({
        where: { id: 'project-123' },
        data: { rd_score: 0.85, is_rd: true },
      });
    });

    it('should classify a low R&D score project as not eligible', async () => {
      const lowScoreResponse = {
        data: {
          ...mockLlmResponse.data,
          rd_score: 0.3,
          is_rd_eligible: false,
          risk_flags: ['Insufficient technical uncertainty', 'Routine engineering work'],
        },
      };

      jest.spyOn(prismaService.project, 'findUniqueOrThrow').mockResolvedValue(mockProject);
      jest.spyOn(llmClientService, 'call').mockResolvedValue(lowScoreResponse);
      jest.spyOn(prismaService.project, 'update').mockResolvedValue({
        ...mockProject,
        rd_score: 0.3,
        is_rd: false,
      });

      const result = await service.classifyProject('project-123');

      expect(result.rdScore).toBe(0.3);
      expect(result.isRdEligible).toBe(false);
      expect(result.riskFlags).toHaveLength(2);

      expect(prismaService.project.update).toHaveBeenCalledWith({
        where: { id: 'project-123' },
        data: { rd_score: 0.3, is_rd: false },
      });
    });

    it('should handle edge case at 0.5 threshold', async () => {
      const thresholdResponse = {
        data: {
          ...mockLlmResponse.data,
          rd_score: 0.5,
          is_rd_eligible: true,
        },
      };

      jest.spyOn(prismaService.project, 'findUniqueOrThrow').mockResolvedValue(mockProject);
      jest.spyOn(llmClientService, 'call').mockResolvedValue(thresholdResponse);
      jest.spyOn(prismaService.project, 'update').mockResolvedValue({
        ...mockProject,
        rd_score: 0.5,
        is_rd: true,
      });

      const result = await service.classifyProject('project-123');

      expect(result.rdScore).toBe(0.5);
      expect(result.isRdEligible).toBe(true);
    });

    it('should clamp rd_score to [0, 1] range', async () => {
      const outOfRangeResponse = {
        data: {
          ...mockLlmResponse.data,
          rd_score: 1.5, // Invalid: > 1
        },
      };

      jest.spyOn(prismaService.project, 'findUniqueOrThrow').mockResolvedValue(mockProject);
      jest.spyOn(llmClientService, 'call').mockResolvedValue(outOfRangeResponse);
      jest.spyOn(prismaService.project, 'update').mockResolvedValue({
        ...mockProject,
        rd_score: 1.0,
        is_rd: true,
      });

      const result = await service.classifyProject('project-123');

      expect(result.rdScore).toBe(1.0); // Clamped to max
    });

    it('should handle negative rd_score', async () => {
      const negativeResponse = {
        data: {
          ...mockLlmResponse.data,
          rd_score: -0.2, // Invalid: < 0
        },
      };

      jest.spyOn(prismaService.project, 'findUniqueOrThrow').mockResolvedValue(mockProject);
      jest.spyOn(llmClientService, 'call').mockResolvedValue(negativeResponse);
      jest.spyOn(prismaService.project, 'update').mockResolvedValue({
        ...mockProject,
        rd_score: 0,
        is_rd: false,
      });

      const result = await service.classifyProject('project-123');

      expect(result.rdScore).toBe(0); // Clamped to min
      expect(result.isRdEligible).toBe(false);
    });

    it('should handle missing optional fields gracefully', async () => {
      const minimalResponse = {
        data: {
          rd_score: 0.7,
          is_rd_eligible: true,
          // Missing optional fields
        },
      };

      jest.spyOn(prismaService.project, 'findUniqueOrThrow').mockResolvedValue(mockProject);
      jest.spyOn(llmClientService, 'call').mockResolvedValue(minimalResponse);
      jest.spyOn(prismaService.project, 'update').mockResolvedValue({
        ...mockProject,
        rd_score: 0.7,
        is_rd: true,
      });

      const result = await service.classifyProject('project-123');

      expect(result.rdScore).toBe(0.7);
      expect(result.keyInnovations).toEqual([]);
      expect(result.criteriaScores).toEqual({});
      expect(result.riskFlags).toEqual([]);
      expect(result.recommendedEvidence).toEqual([]);
    });

    it('should log warning when LLM score deviates from weighted criteria', async () => {
      const deviatingResponse = {
        data: {
          rd_score: 0.9, // High score
          is_rd_eligible: true,
          criteria_scores: {
            technical_uncertainty: { score: 0.3, justification: 'Low uncertainty' },
            systematic_approach: { score: 0.2, justification: 'Ad-hoc approach' },
            technological_advancement: { score: 0.1, justification: 'Minimal advancement' },
          },
          key_innovations: [],
          risk_flags: [],
          recommended_evidence: [],
        },
      };

      const loggerSpy = jest.spyOn(service['logger'], 'warn');

      jest.spyOn(prismaService.project, 'findUniqueOrThrow').mockResolvedValue(mockProject);
      jest.spyOn(llmClientService, 'call').mockResolvedValue(deviatingResponse);
      jest.spyOn(prismaService.project, 'update').mockResolvedValue({
        ...mockProject,
        rd_score: 0.9,
        is_rd: true,
      });

      await service.classifyProject('project-123');

      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy.mock.calls[0][0]).toContain('deviates');
    });

    it('should throw error when project not found', async () => {
      jest.spyOn(prismaService.project, 'findUniqueOrThrow').mockRejectedValue(
        new Error('Project not found')
      );

      await expect(service.classifyProject('non-existent')).rejects.toThrow('Project not found');
    });

    it('should handle LLM service errors', async () => {
      jest.spyOn(prismaService.project, 'findUniqueOrThrow').mockResolvedValue(mockProject);
      jest.spyOn(llmClientService, 'call').mockRejectedValue(
        new Error('LLM service unavailable')
      );

      await expect(service.classifyProject('project-123')).rejects.toThrow('LLM service unavailable');
    });
  });

  describe('classifyAllProjects', () => {
    const mockProjects = [
      { ...mockProject, id: 'project-1', title: 'Project 1' },
      { ...mockProject, id: 'project-2', title: 'Project 2' },
      { ...mockProject, id: 'project-3', title: 'Project 3' },
    ];

    it('should classify all projects for a company', async () => {
      jest.spyOn(prismaService.project, 'findMany').mockResolvedValue(mockProjects);
      jest.spyOn(prismaService.project, 'findUniqueOrThrow').mockImplementation((args: any) => {
        return Promise.resolve(mockProjects.find(p => p.id === args.where.id)!);
      });
      jest.spyOn(llmClientService, 'call').mockResolvedValue(mockLlmResponse);
      jest.spyOn(prismaService.project, 'update').mockImplementation((args: any) => {
        const project = mockProjects.find(p => p.id === args.where.id)!;
        return Promise.resolve({ ...project, ...args.data });
      });

      const results = await service.classifyAllProjects('company-123');

      expect(results).toHaveLength(3);
      expect(results[0].projectId).toBe('project-1');
      expect(results[1].projectId).toBe('project-2');
      expect(results[2].projectId).toBe('project-3');
      expect(prismaService.project.findMany).toHaveBeenCalledWith({
        where: { company_id: 'company-123' },
      });
    });

    it('should handle empty project list', async () => {
      jest.spyOn(prismaService.project, 'findMany').mockResolvedValue([]);

      const results = await service.classifyAllProjects('company-123');

      expect(results).toHaveLength(0);
    });

    it('should continue processing when one project fails', async () => {
      jest.spyOn(prismaService.project, 'findMany').mockResolvedValue(mockProjects);
      jest.spyOn(prismaService.project, 'findUniqueOrThrow').mockImplementation((args: any) => {
        const project = mockProjects.find(p => p.id === args.where.id);
        if (args.where.id === 'project-2') {
          return Promise.reject(new Error('Classification failed'));
        }
        return Promise.resolve(project!);
      });
      jest.spyOn(llmClientService, 'call').mockResolvedValue(mockLlmResponse);
      jest.spyOn(prismaService.project, 'update').mockImplementation((args: any) => {
        const project = mockProjects.find(p => p.id === args.where.id)!;
        return Promise.resolve({ ...project, ...args.data });
      });

      const loggerSpy = jest.spyOn(service['logger'], 'error');

      const results = await service.classifyAllProjects('company-123');

      expect(results).toHaveLength(3);
      expect(results[0].rdScore).toBe(0.85); // Success
      expect(results[1].rdScore).toBe(0); // Failed
      expect(results[1].isRdEligible).toBe(false);
      expect(results[1].riskFlags[0]).toContain('Classification failed');
      expect(results[2].rdScore).toBe(0.85); // Success

      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should handle partial LLM failures gracefully', async () => {
      jest.spyOn(prismaService.project, 'findMany').mockResolvedValue(mockProjects);
      jest.spyOn(prismaService.project, 'findUniqueOrThrow').mockImplementation((args: any) => {
        return Promise.resolve(mockProjects.find(p => p.id === args.where.id)!);
      });
      jest.spyOn(llmClientService, 'call').mockImplementation(() => {
        // Fail on second call
        if (llmClientService.call['mock'].calls.length === 2) {
          return Promise.reject(new Error('LLM timeout'));
        }
        return Promise.resolve(mockLlmResponse);
      });
      jest.spyOn(prismaService.project, 'update').mockImplementation((args: any) => {
        const project = mockProjects.find(p => p.id === args.where.id)!;
        return Promise.resolve({ ...project, ...args.data });
      });

      const results = await service.classifyAllProjects('company-123');

      expect(results).toHaveLength(3);
      // First and third should succeed, second should fail
      const failedResult = results.find(r => r.rdScore === 0);
      expect(failedResult).toBeDefined();
      expect(failedResult?.riskFlags[0]).toContain('LLM timeout');
    });
  });

  describe('Integration with Prompt Manager', () => {
    it('should pass correct project data to LLM', async () => {
      const callSpy = jest.spyOn(llmClientService, 'call').mockResolvedValue(mockLlmResponse);
      jest.spyOn(prismaService.project, 'findUniqueOrThrow').mockResolvedValue(mockProject);
      jest.spyOn(prismaService.project, 'update').mockResolvedValue({
        ...mockProject,
        rd_score: 0.85,
        is_rd: true,
      });

      await service.classifyProject('project-123');

      expect(callSpy).toHaveBeenCalled();
      const promptArg = callSpy.mock.calls[0][0];
      
      // Verify prompt contains project details
      expect(promptArg).toContain('AI-Powered Recommendation Engine');
      expect(promptArg).toContain('machine learning algorithm');
    });
  });
});
