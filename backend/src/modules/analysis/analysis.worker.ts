/**
 * AnalysisWorker — processes ANALYSIS_RUN jobs from the 'analysis' queue.
 *
 * Flow:
 *   1. API controller enqueues job → returns { jobId, status: 'queued' }
 *   2. Worker picks up job → calls AnalysisService.runAnalysis()
 *   3. On success: job result stored in BullMQ (retrievable via GET /analysis/jobs/:jobId)
 *   4. On failure: BullMQ retries with exponential backoff (3 attempts)
 *
 * Concurrency = 2: allows 2 LLM calls to run in parallel without overwhelming API rate limits.
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_ANALYSIS, JobType } from '../../common/queue/queue.constants';
import type { AnalysisRunJobData } from '../../common/queue/queue.jobs';
import { AnalysisService } from './analysis.service';

@Processor(QUEUE_ANALYSIS, { concurrency: 2 })
export class AnalysisWorker extends WorkerHost {
  private readonly logger = new Logger(AnalysisWorker.name);

  constructor(private readonly analysisService: AnalysisService) {
    super();
  }

  async process(job: Job<AnalysisRunJobData>): Promise<unknown> {
    if (job.name !== JobType.ANALYSIS_RUN) {
      this.logger.warn(`[QUEUE] Unknown job type received: ${job.name} — skipping`);
      return;
    }

    const { userId, companyId } = job.data;
    this.logger.log(
      `[QUEUE] Processing ANALYSIS_RUN | jobId=${job.id} company=${companyId} attempt=${job.attemptsMade + 1}`,
    );

    await job.updateProgress(10);

    const result = await this.analysisService.runAnalysis(userId, companyId);

    await job.updateProgress(100);

    this.logger.log(
      `[QUEUE] ANALYSIS_RUN complete | jobId=${job.id} company=${companyId} rdScore=${result.rdScore} estimated=${result.estimatedAmount}`,
    );

    return result;
  }
}
