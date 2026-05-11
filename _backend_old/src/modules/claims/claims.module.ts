/**
 * ClaimsModule — wires up BullMQ queue + worker for async claim generation.
 *
 * Queue: 'claims' → CLAIM_GENERATION jobs
 * Worker: ClaimsWorker processes jobs from that queue
 *
 * InjectQueue(QUEUE_CLAIMS) is available to ClaimsController for enqueuing.
 */

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { ClaimsWorker } from './claims.worker';
import { PdfGeneratorService } from './pdf-generator.service';
import { AnalysisModule } from '../analysis/analysis.module';
import { QUEUE_CLAIMS } from '../../common/queue/queue.constants';

@Module({
  imports: [
    AnalysisModule,
    BullModule.registerQueue({ name: QUEUE_CLAIMS }),
  ],
  controllers: [ClaimsController],
  providers: [ClaimsService, ClaimsWorker, PdfGeneratorService],
})
export class ClaimsModule {}
