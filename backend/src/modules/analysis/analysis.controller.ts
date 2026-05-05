/**
 * AnalysisController — HTTP layer for R&D analysis operations.
 *
 * POST /run     → Enqueues ANALYSIS_RUN job (async), returns { jobId, status: 'queued' }
 * GET  /jobs/:jobId → Polls job status and result from BullMQ
 * GET  /        → Lists all completed AnalysisRuns from DB
 * GET  /:id     → Gets a single AnalysisRun from DB
 *
 * Design decision: POST /run is now fire-and-forget because LLM classification
 * can take 10-60s. The client polls GET /jobs/:jobId until state === 'completed'.
 */

import { Controller, Get, Post, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { AnalysisService } from './analysis.service';
import { QUEUE_ANALYSIS, JobType } from '../../common/queue/queue.constants';
import type { AnalysisRunJobData } from '../../common/queue/queue.jobs';

@UseGuards(JwtAuthGuard)
@Controller('company/:companyId/analysis')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    @InjectQueue(QUEUE_ANALYSIS) private readonly analysisQueue: Queue,
  ) {}

  /**
   * Enqueue analysis run job.
   * Returns immediately with jobId — client polls GET /jobs/:jobId for result.
   */
  @Post('run')
  async run(@CurrentUser() user: JwtPayload, @Param('companyId') companyId: string) {
    const jobData: AnalysisRunJobData = { userId: user.sub, companyId };
    const job = await this.analysisQueue.add(JobType.ANALYSIS_RUN, jobData);

    return {
      jobId: job.id,
      queue: QUEUE_ANALYSIS,
      status: 'queued',
      message: 'Analysis started. Poll GET /jobs/:jobId for result.',
    };
  }

  /**
   * Poll job status. States: waiting → active → completed | failed
   */
  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    const job = await this.analysisQueue.getJob(jobId);
    if (!job) throw new NotFoundException(`Job ${jobId} not found`);

    const state = await job.getState();
    const progress = job.progress;

    return {
      jobId,
      state,
      progress,
      ...(state === 'completed' ? { result: job.returnvalue } : {}),
      ...(state === 'failed' ? { error: job.failedReason } : {}),
    };
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param('companyId') companyId: string) {
    return this.analysisService.findAll(user.sub, companyId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.analysisService.findOne(user.sub, companyId, id);
  }
}
