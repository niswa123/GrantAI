/**
 * AnalysisModule — wires up BullMQ queue + worker for async analysis runs.
 *
 * Queue: 'analysis' → ANALYSIS_RUN jobs
 * Worker: AnalysisWorker processes jobs from that queue
 *
 * InjectQueue(QUEUE_ANALYSIS) is available to AnalysisController for enqueuing.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { AnalysisWorker } from './analysis.worker';
import { RdClassifierService } from './rd-classifier.service';
import { LlmClientService } from './llm-client.service';
import { QUEUE_ANALYSIS } from '../../common/queue/queue.constants';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: QUEUE_ANALYSIS }),
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisWorker, RdClassifierService, LlmClientService],
  exports: [AnalysisService, RdClassifierService, LlmClientService],
})
export class AnalysisModule {}
