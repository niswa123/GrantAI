import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class HealthService {
  private redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.config.get('REDIS_HOST', 'localhost'),
      port: this.config.get('REDIS_PORT', 6379),
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });
  }

  async getDetailedHealth() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkLLM(),
    ]);

    const [database, redis, llm] = checks.map((result) =>
      result.status === 'fulfilled' ? result.value : { status: 'error', error: result.reason?.message },
    );

    const allHealthy = [database, redis, llm].every((check) => check.status === 'healthy');

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      checks: {
        database,
        redis,
        llm,
      },
      system: {
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB',
        },
        cpu: process.cpuUsage(),
      },
    };
  }

  private async checkDatabase() {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency: `${latency}ms`,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  private async checkRedis() {
    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency: `${latency}ms`,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  private async checkLLM() {
    const apiKey = this.config.get('LLM_API_KEY');

    if (!apiKey) {
      return {
        status: 'not_configured',
        message: 'LLM_API_KEY not set',
      };
    }

    // We don't actually call the LLM API for health check (costs money)
    // Just verify the key is configured
    return {
      status: 'configured',
      message: 'LLM API key is set',
    };
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
