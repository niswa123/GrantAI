/**
 * ClaimsController — HTTP layer for R&D tax claim operations.
 *
 * POST /generate       → Enqueues CLAIM_GENERATION job (async), returns { jobId, status: 'queued' }
 * GET  /jobs/:jobId    → Polls job status and result from BullMQ
 * GET  /               → Lists all claims from DB
 * GET  /:id            → Gets a single claim from DB
 * GET  /:id/pdf        → Downloads the claim as a styled PDF
 * POST /:id/submit     → Transitions claim to 'submitted' status
 */

import { Controller, Get, Post, Param, UseGuards, NotFoundException, Res } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ClaimsService } from './claims.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { QUEUE_CLAIMS, JobType } from '../../common/queue/queue.constants';
import type { ClaimGenerationJobData } from '../../common/queue/queue.jobs';

@UseGuards(JwtAuthGuard)
@Controller('company/:companyId/claims')
export class ClaimsController {
  constructor(
    private readonly claimsService: ClaimsService,
    private readonly pdfGenerator: PdfGeneratorService,
    @InjectQueue(QUEUE_CLAIMS) private readonly claimsQueue: Queue,
  ) {}

  @Post('generate')
  async generate(@CurrentUser() user: JwtPayload, @Param('companyId') companyId: string) {
    const jobData: ClaimGenerationJobData = { userId: user.sub, companyId };
    const job = await this.claimsQueue.add(JobType.CLAIM_GENERATION, jobData);

    return {
      jobId: job.id,
      queue: QUEUE_CLAIMS,
      status: 'queued',
      message: 'Claim generation started. Poll GET /jobs/:jobId for result.',
    };
  }

  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    const job = await this.claimsQueue.getJob(jobId);
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
    return this.claimsService.findAll(user.sub, companyId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.claimsService.findOne(user.sub, companyId, id);
  }

  /**
   * Download a styled PDF for a specific claim.
   * GET /company/:companyId/claims/:id/pdf
   */
  @Get(':id/pdf')
  async downloadPdf(
    @CurrentUser() user: JwtPayload,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const claim = await this.claimsService.findOne(user.sub, companyId, id);
    const company = await this.claimsService.getCompany(user.sub, companyId);

    if (!claim.generated_text) {
      throw new NotFoundException('Claim has no generated text yet. Run generate first.');
    }

    const pdfBuffer = await this.pdfGenerator.generateClaimPdf({
      claimId: claim.id,
      companyName: company.name,
      companyCountry: company.country,
      estimatedAmount: Number(claim.estimated_amount),
      rdExpensesTotal: Number(claim.rd_expenses_total),
      createdAt: claim.created_at,
      generatedText: claim.generated_text,
    });

    const filename = `grantai-claim-${claim.id.slice(0, 8)}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Post(':id/submit')
  submit(
    @CurrentUser() user: JwtPayload,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.claimsService.submit(user.sub, companyId, id);
  }
}
