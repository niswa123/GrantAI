import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Advanced Rate Limiting Configuration
 * 
 * Different limits for different endpoint categories:
 * - Auth: Strict limits to prevent brute force
 * - Analysis/Claims: Moderate limits (LLM-heavy operations)
 * - CRUD: Generous limits for normal operations
 * - Public: Very strict limits
 */

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'short',
      ttl: 1000, // 1 second
      limit: 10, // 10 requests per second (default)
    },
    {
      name: 'medium',
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    },
    {
      name: 'long',
      ttl: 3600000, // 1 hour
      limit: 1000, // 1000 requests per hour
    },
  ],
};

/**
 * Endpoint-specific rate limits
 */
export const RATE_LIMITS = {
  // Authentication endpoints - strict to prevent brute force
  AUTH: {
    LOGIN: { ttl: 60000, limit: 5 }, // 5 attempts per minute
    REGISTER: { ttl: 3600000, limit: 3 }, // 3 registrations per hour per IP
  },

  // LLM-heavy operations - moderate limits
  ANALYSIS: {
    RUN: { ttl: 60000, limit: 2 }, // 2 analysis runs per minute
    LIST: { ttl: 60000, limit: 20 }, // 20 list requests per minute
  },

  CLAIMS: {
    GENERATE: { ttl: 60000, limit: 2 }, // 2 claim generations per minute
    LIST: { ttl: 60000, limit: 20 },
  },

  // CRUD operations - generous limits
  PROJECTS: {
    CREATE: { ttl: 60000, limit: 10 },
    UPDATE: { ttl: 60000, limit: 20 },
    DELETE: { ttl: 60000, limit: 10 },
    LIST: { ttl: 60000, limit: 50 },
  },

  EXPENSES: {
    CREATE: { ttl: 60000, limit: 20 },
    DELETE: { ttl: 60000, limit: 20 },
    LIST: { ttl: 60000, limit: 50 },
  },

  // Public endpoints - very strict
  PUBLIC: {
    SUPPORTED_COUNTRIES: { ttl: 60000, limit: 10 },
  },

  // Integration endpoints - moderate
  INTEGRATIONS: {
    GITHUB_REPOS: { ttl: 60000, limit: 10 },
    JIRA_PROJECTS: { ttl: 60000, limit: 10 },
  },
};
