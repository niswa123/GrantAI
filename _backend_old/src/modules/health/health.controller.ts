import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

/**
 * Health Check Controller
 * 
 * Provides endpoints for monitoring application health:
 * - /health - Basic health check
 * - /health/detailed - Detailed health status with dependencies
 */
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
    };
  }

  @Get('detailed')
  async detailedCheck() {
    return this.healthService.getDetailedHealth();
  }
}
