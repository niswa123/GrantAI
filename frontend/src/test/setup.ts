// Setup file for Vitest
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next-Auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'test-user', email: 'test@example.com' } },
    status: 'authenticated',
  }),
  getSession: vi.fn(),
}));

// Mock next/headers — cookies() requires a real request context in Next.js App Router
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: () => [],
    get: () => undefined,
  }),
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

