/**
 * AnalyticsController — Exposes internal product metrics.
 *
 * GET /analytics → Full metrics report (users, companies, analysis, claims, funnel)
 *
 * Protected by JWT. Intended for internal/admin use.
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  getReport() {
    return this.analyticsService.getReport();
  }
}
