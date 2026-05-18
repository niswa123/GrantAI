import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as companyActions from '@/app/actions/companyActions';
import * as unifiedSyncActions from '@/app/actions/unifiedSyncActions';
import prisma from '@/lib/prisma';

// Mock Next-Auth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
}));

// Mock next/headers (cookies) — required by runUnifiedSync
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: () => [],
  }),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    company: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    integration: {
      findMany: vi.fn(),
    },
  },
}));

// Mock fetch for unifiedSyncActions
global.fetch = vi.fn();

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

    // Use objectContaining — real code also sets user_id and last_sync_at
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
    (prisma.integration.findMany as any).mockResolvedValue([
      { provider: 'github' }, // One connected integration
    ]);
  });

  it('runUnifiedSync runs without error for Quick Sync (isDeepSync=false)', async () => {
    // Mock the github/sync API response returning no commits
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ commits: [], repos: [] }),
    });

    const result = await unifiedSyncActions.runUnifiedSync({
      companyId: 'test-company',
      salaryCosts: 100000,
      devCosts: 20000,
      baseUrl: 'http://localhost',
      isDeepSync: false,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost/api/integrations/github/sync',
      expect.objectContaining({ method: 'POST' })
    );
    // 0 commits → 0 claims → success=false but no thrown error
    expect(result.sources[0].provider).toBe('github');
  });

  it('runUnifiedSync runs without error for Deep Audit (isDeepSync=true)', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ commits: [], repos: [] }),
    });

    const result = await unifiedSyncActions.runUnifiedSync({
      companyId: 'test-company',
      salaryCosts: 100000,
      devCosts: 20000,
      baseUrl: 'http://localhost',
      isDeepSync: true,
    });

    // Function should accept the flag without crashing
    expect(global.fetch).toHaveBeenCalled();
    expect(result).toHaveProperty('sources');
  });
});
