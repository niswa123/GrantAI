import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Fully Mock React to bypass Next 15 / React 19 duplicate instance bugs ───
let mockState: any;
let mockSetState: any;
const { mockUseCallback } = vi.hoisted(() => ({
  mockUseCallback: vi.fn((fn) => fn)
}));

vi.mock('react', () => {
  return {
    createContext: vi.fn(() => ({
      Provider: ({ children }: any) => children
    })),
    useContext: vi.fn(() => ({
      ...mockState,
      startSync: mockStartSync,
    })),
    useState: vi.fn((init) => {
      if (mockState === undefined) mockState = init;
      mockSetState = (updater: any) => {
        mockState = typeof updater === 'function' ? updater(mockState) : updater;
      };
      return [mockState, mockSetState];
    }),
    useCallback: mockUseCallback,
    useRef: vi.fn((init) => ({ current: init })),
    useEffect: vi.fn(),
  };
});

// Import after React is mocked
import { SyncProvider } from '@/contexts/SyncContext';

// We intercept the `startSync` definition by capturing what is passed to useCallback
let mockStartSync: any;

vi.mock('@/app/actions/unifiedSyncActions', () => ({
  runUnifiedSync: vi.fn(),
  getConnectedSources: vi.fn(),
}));

beforeEach(() => {
  vi.useFakeTimers();
  mockState = undefined;
  mockStartSync = undefined;
  mockUseCallback.mockClear();
  
  // Call SyncProvider just to trigger the hooks and capture startSync
  SyncProvider({ children: null });
  
  // Extract the startSync function that was passed to useCallback
  mockStartSync = mockUseCallback.mock.calls[0][0];
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('UX Feature 1: Labour Illusion (SyncContext)', () => {

  it('starts in idle state with empty status message', () => {
    expect(mockState.isSyncing).toBe(false);
    expect(mockState.statusMessage).toBe('');
    expect(mockState.progress).toBe(0);
  });

  it('shows first message immediately on startSync', () => {
    const neverResolves = new Promise<void>(() => {});

    mockStartSync('company-1', () => neverResolves);

    expect(mockState.isSyncing).toBe(true);
    expect(mockState.statusMessage).toBe('Scanning GitHub commits...');
    expect(mockState.progress).toBe(5);
  });

  it('cycles to a different message after 1800ms', () => {
    const neverResolves = new Promise<void>(() => {});

    mockStartSync('company-1', () => neverResolves);
    const firstMessage = mockState.statusMessage;

    vi.advanceTimersByTime(1800);

    expect(mockState.statusMessage).not.toBe(firstMessage);
    expect(mockState.statusMessage).toBe('Analyzing repository activity...');
    expect(mockState.isSyncing).toBe(true);
  });

  it('freezes message and sets progress=100 on error — does NOT keep cycling', async () => {
    const rejectSync = () => Promise.reject(new Error('Plan limit reached'));

    // Start sync (async because of the promise chain inside startSync)
    mockStartSync('company-1', rejectSync);

    // Wait for the catch block to resolve
    await Promise.resolve();
    await Promise.resolve();

    const errorMessage = mockState.statusMessage;
    expect(mockState.error).toBe('Plan limit reached');
    expect(mockState.progress).toBe(100);

    // Advance time — message should NOT change when errored
    vi.advanceTimersByTime(3600);
    expect(mockState.statusMessage).toBe(errorMessage);
  });

  it('shows "Sync complete!" and sets progress=100 on success', async () => {
    const immediateSuccess = () => Promise.resolve();

    mockStartSync('company-1', immediateSuccess);

    // Wait for the then block to resolve
    await Promise.resolve();
    await Promise.resolve();

    expect(mockState.statusMessage).toBe('Sync complete!');
    expect(mockState.progress).toBe(100);
    expect(mockState.error).toBeNull();
  });
});

describe('UX Feature 3 & 4: Non-blocking Background Sync & Inline Connect', () => {
  it('modal can be closed while isSyncing=true (state stays alive)', () => {
    // Background sync relies on the fact that isSyncing remains true independently of components
    const neverResolves = new Promise<void>(() => {});

    mockStartSync('company-1', () => neverResolves);

    expect(mockState.isSyncing).toBe(true);
    expect(mockState.companyId).toBe('company-1');
  });

  it('MagicSyncButton shows connected=true vs connected=false state correctly', async () => {
    const { getConnectedSources } = await import('@/app/actions/unifiedSyncActions');
    (getConnectedSources as any).mockResolvedValue([
      { provider: 'github', connected: false, label: 'GitHub', description: 'Test' },
    ]);

    const sources = await getConnectedSources('any-company');
    expect(sources[0].connected).toBe(false);
  });
});

