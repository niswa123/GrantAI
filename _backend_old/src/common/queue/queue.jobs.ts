/**
 * Job payload DTOs for BullMQ queues.
 * Each job data interface is the typed payload that goes into the queue.
 * Workers use these to safely destructure job.data.
 */

export interface AnalysisRunJobData {
  userId: string;
  companyId: string;
}

export interface ClaimGenerationJobData {
  userId: string;
  companyId: string;
}
