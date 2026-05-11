/**
 * Queue name constants — single source of truth for all BullMQ queue/worker references.
 * Always import from here, never hardcode queue names inline.
 */

export const QUEUE_ANALYSIS = 'analysis';
export const QUEUE_CLAIMS = 'claims';

export const JobType = {
  ANALYSIS_RUN: 'ANALYSIS_RUN',
  CLAIM_GENERATION: 'CLAIM_GENERATION',
} as const;

export type JobType = (typeof JobType)[keyof typeof JobType];
