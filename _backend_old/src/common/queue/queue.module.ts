/**
 * QueueModule — global BullMQ / Redis configuration.
 *
 * Registers two queues:
 *   - analysis  → ANALYSIS_RUN jobs
 *   - claims    → CLAIM_GENERATION jobs
 *
 * Uses @nestjs/bullmq which wraps bullmq v5 with NestJS DI.
 * ConfigModule must be initialized globally before this module is loaded.
 */

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE_ANALYSIS, QUEUE_CLAIMS } from './queue.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          lazyConnect: true,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 500 },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_ANALYSIS },
      { name: QUEUE_CLAIMS },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
