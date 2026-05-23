import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as companyActions from '@/app/actions/companyActions';
import * as unifiedSyncActions from '@/app/actions/unifiedSyncActions';
import prisma from '@/lib/prisma';

// Mock Next-Auth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: () => [] }),
}));

// Mock access-control to always grant access
vi.mock('@/lib/access-control', () => ({
  getUserAccessLevel: vi.fn().mockResolvedValue({
    hasAccess: true,
    isFreeTierLimitReached: false,
    tier: 'PRO',
  }),
}));

// Mock rd-engine modules so no actual LLM calls happen
vi.mock('@/lib/rd-engine/pipeline', () => ({
  runRdPipeline: vi.fn().mockResolvedValue({
    classification: {
      rd_score: 0.8,
      is_rd_eligible: true,
      criteria_scores: {},
      key_innovations: [],
      disqualifying_factors_found: [],
      risk_flags: [],
      recommended_evidence: [],
      step_by_step_analysis: '',
    },
    claimText: { claim_text: { company_overview: 'Test' }, metadata: {} },
  }),
}));

vi.mock('@/lib/rd-engine/credit-calculator', () => ({
  computeCredit: vi.fn().mockReturnValue({
    creditAmount: 10000,
    qualifyingExpenditure: 50000,
    appliedRate: 0.2,
    program: 'TEST',
    breakdown: {},
    tieredBreakdown: [],
    smeApplied: true,
  }),
}));

// Mock integration sync libs to return empty results (no external network calls)
vi.mock('@/lib/integrations/github-sync', () => ({
  runGithubSync: vi.fn().mockResolvedValue({ repos: [], commits: [], summary: '', scannedSince: '' }),
}));

vi.mock('@/lib/integrations/linear-sync', () => ({
  runLinearSync: vi.fn().mockResolvedValue({ groups: [], summary: '', scannedSince: '' }),
}));

vi.mock('@/lib/integrations/jira-sync', () => ({
  runJiraSync: vi.fn().mockResolvedValue({ groups: [], summary: '', cloudName: 'Test', scannedSince: '' }),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    company: {
      findUnique: vi.fn().mockResolvedValue({ country: 'Netherlands' }),
      findFirst: vi.fn().mockResolvedValue({ id: 'test-company', name: 'Test Co' }),
      update: vi.fn(),
    },
    integration: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    claim: {
      create: vi.fn().mockResolvedValue({ id: 'claim-1' }),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({
        email: 'test@test.com',
        subscription_tier: 'PRO',
        subscription_status: 'active',
        claim_count: 0,
      }),
    },
  },
}));

describe('Backend Feature 2: Auto-fill (Financial Memory)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCompanySyncDefaults retrieves stored estimated_salaries', async () => {
    (prisma.company.findUnique as any).mockResolvedValue({
      estimated_salaries: 250000,
      estimated_dev_costs: 45000,
      last_sync_at: new Date('2026-01-01'),
    });

    const defaults = await companyActions.getCompanySyncDefaults('company-123');

    expect(prisma.company.findUnique).toHaveBeenCalledWith({
      where: { id: 'company-123' },
      select: { estimated_salaries: true, estimated_dev_costs: true, last_sync_at: true },
    });
    expect(defaults.salaries).toBe(250000);
    expect(defaults.devCosts).toBe(45000);
  });

  it('updateCompanySyncDefaults saves new salary and dev cost values', async () => {
    await companyActions.updateCompanySyncDefaults('company-123', 300000, 50000);

    expect(prisma.company.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          estimated_salaries: 300000,
          estimated_dev_costs: 50000,
        }),
      })
    );
  });
});

describe('Backend Feature 5: Quick Sync vs Deep Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.integration.findMany as any).mockResolvedValue([{ provider: 'github' }]);
    (prisma.company.findFirst as any).mockResolvedValue({ id: 'test-company', name: 'Test Co' });
    (prisma.company.findUnique as any).mockResolvedValue({ country: 'Netherlands' });
    (prisma.claim.create as any).mockResolvedValue({ id: 'claim-1' });
  });

  it('runUnifiedSync runs without error for Quick Sync (isDeepSync=false)', async () => {
    const result = await unifiedSyncActions.runUnifiedSync({
      companyId: 'test-company',
      salaryCosts: 100000,
      devCosts: 20000,
      baseUrl: 'http://localhost',
      isDeepSync: false,
    });

    // 0 commits returned by mock → 0 claims → success=false but no thrown error
    expect(result).toHaveProperty('sources');
    expect(result.sources[0].provider).toBe('github');
  });

  it('runUnifiedSync runs without error for Deep Audit (isDeepSync=true)', async () => {
    const result = await unifiedSyncActions.runUnifiedSync({
      companyId: 'test-company',
      salaryCosts: 100000,
      devCosts: 20000,
      baseUrl: 'http://localhost',
      isDeepSync: true,
    });

    expect(result).toHaveProperty('sources');
  });
});
