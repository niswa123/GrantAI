/**
 * rate-limiter.ts — Edge-safe in-memory rate limiter.
 *
 * Uses a sliding window algorithm keyed by IP + endpoint.
 * Works on both Edge and Node.js runtimes.
 *
 * For production with multiple instances: replace with @upstash/ratelimit + Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Global Map survives across requests in the same process
const store = new Map<string, RateLimitEntry>();

/**
 * Check rate limit for a given key.
 *
 * @param key     Unique identifier, e.g. `"register:127.0.0.1"` or `"forgot-password:user@example.com"`
 * @param limit   Max requests allowed in `windowMs`
 * @param windowMs  Time window in milliseconds (default 60 seconds)
 * @returns `{ allowed: boolean; remaining: number; resetAt: number }`
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  // If no entry or window has expired, start fresh
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  // Increment counter
  entry.count++;

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Get the real client IP from Next.js request headers.
 * Works behind Vercel, Cloudflare, and other reverse proxies.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||       // Cloudflare
    request.headers.get('x-real-ip') ||               // Nginx
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() || // Generic proxy
    '127.0.0.1'
  );
}
