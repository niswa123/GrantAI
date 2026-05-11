/**
 * ClaimsWorker — processes CLAIM_GENERATION jobs from the 'claims' queue.
 *
 * Flow:
 *   1. API controller enqueues job → returns { jobId, status: 'queued' }
 *   2. Worker picks up job → calls ClaimsService.generate()
 *   3. On success: claim entity stored in DB, job result = claim record
 *   4. On failure: BullMQ retries with exponential backoff (3 attempts)
 *
 * Concurrency = 1: claim generation is LLM-heavy (long prompt), serialize to avoid
 * overloading the LLM API and ensure consistent DB state.
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_CLAIMS, JobType } from '../../common/queue/queue.constants';
import type { ClaimGenerationJobData } from '../../common/queue/queue.jobs';
import { ClaimsService } from './claims.service';

@Processor(QUEUE_CLAIMS, { concurrency: 1 })
export class ClaimsWorker extends WorkerHost {
  private readonly logger = new Logger(ClaimsWorker.name);

  constructor(private readonly claimsService: ClaimsService) {
    super();
  }

  async process(job: Job<ClaimGenerationJobData>): Promise<unknown> {
    if (job.name !== JobType.CLAIM_GENERATION) {
      this.logger.warn(`[QUEUE] Unknown job type received: ${job.name} — skipping`);
      return;
    }

    const { userId, companyId } = job.data;
    this.logger.log(
      `[QUEUE] Processing CLAIM_GENERATION | jobId=${job.id} company=${companyId} attempt=${job.attemptsMade + 1}`,
    );

    await job.updateProgress(10);

    const claim = await this.claimsService.generate(userId, companyId);

    await job.updateProgress(100);

    this.logger.log(
      `[QUEUE] CLAIM_GENERATION complete | jobId=${job.id} company=${companyId} claimId=${claim.id} status=${claim.status}`,
    );

    return claim;
  }
}
