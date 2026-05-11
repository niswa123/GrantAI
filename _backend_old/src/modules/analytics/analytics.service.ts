/**
 * Analytics Service — Aggregates key business metrics from the database.
 *
 * All queries are read-only. No external services needed.
 * Designed for internal admin use — endpoint is protected by JWT.
 *
 * Metrics tracked (per TZ Section 12):
 * - Total registrations
 * - Analysis runs (total + per day)
 * - Claims generated
 * - Conversion: Analysis → Claim
 * - Revenue potential (sum of estimated credits)
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface AnalyticsReport {
  users: {
    total: number;
    lastDay: number;
    lastWeek: number;
  };
  companies: {
    total: number;
    withProjects: number;
    withExpenses: number;
  };
  analysis: {
    totalRuns: number;
    lastDay: number;
    lastWeek: number;
    avgRdScore: number;
    avgEstimatedAmount: number;
  };
  claims: {
    total: number;
    byStatus: Record<string, number>;
    totalEstimatedCredit: number;
  };
  funnel: {
    registrations: number;
    companiesCreated: number;
    analysisRan: number;
    claimsGenerated: number;
    claimsSubmitted: number;
    conversionAnalysisToClaim: string;
    conversionClaimToSubmit: string;
  };
  generatedAt: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(): Promise<AnalyticsReport> {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ── Users ──────────────────────────────────────────────────────────────
    const [totalUsers, usersLastDay, usersLastWeek] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { created_at: { gte: dayAgo } } }),
      this.prisma.user.count({ where: { created_at: { gte: weekAgo } } }),
    ]);

    // ── Companies ──────────────────────────────────────────────────────────
    const [totalCompanies, companiesWithProjects, companiesWithExpenses] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.company.count({ where: { projects: { some: {} } } }),
      this.prisma.company.count({ where: { expenses: { some: {} } } }),
    ]);

    // ── Analysis ───────────────────────────────────────────────────────────
    const [totalRuns, runsLastDay, runsLastWeek, analysisAgg] = await Promise.all([
      this.prisma.analysisRun.count(),
      this.prisma.analysisRun.count({ where: { created_at: { gte: dayAgo } } }),
      this.prisma.analysisRun.count({ where: { created_at: { gte: weekAgo } } }),
      this.prisma.analysisRun.aggregate({
        _avg: { rd_score: true, estimated_amount: true },
      }),
    ]);

    // ── Claims ─────────────────────────────────────────────────────────────
    const allClaims = await this.prisma.claim.findMany({
      select: { status: true, estimated_amount: true },
    });

    const byStatus: Record<string, number> = {};
    let totalEstimatedCredit = 0;
    for (const c of allClaims) {
      byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
      totalEstimatedCredit += Number(c.estimated_amount);
    }

    // ── Funnel ─────────────────────────────────────────────────────────────
    const claimsGenerated = allClaims.length;
    const claimsSubmitted = byStatus['submitted'] ?? 0;

    const conversionAnalysisToClaim =
      totalRuns > 0
        ? `${((claimsGenerated / totalRuns) * 100).toFixed(1)}%`
        : '0%';

    const conversionClaimToSubmit =
      claimsGenerated > 0
        ? `${((claimsSubmitted / claimsGenerated) * 100).toFixed(1)}%`
        : '0%';

    return {
      users: {
        total: totalUsers,
        lastDay: usersLastDay,
        lastWeek: usersLastWeek,
      },
      companies: {
        total: totalCompanies,
        withProjects: companiesWithProjects,
        withExpenses: companiesWithExpenses,
      },
      analysis: {
        totalRuns,
        lastDay: runsLastDay,
        lastWeek: runsLastWeek,
        avgRdScore: Number((analysisAgg._avg.rd_score ?? 0).toFixed(3)),
        avgEstimatedAmount: Number((analysisAgg._avg.estimated_amount ?? 0).toFixed(2)),
      },
      claims: {
        total: claimsGenerated,
        byStatus,
        totalEstimatedCredit: Number(totalEstimatedCredit.toFixed(2)),
      },
      funnel: {
        registrations: totalUsers,
        companiesCreated: totalCompanies,
        analysisRan: totalRuns,
        claimsGenerated,
        claimsSubmitted,
        conversionAnalysisToClaim,
        conversionClaimToSubmit,
      },
      generatedAt: now.toISOString(),
    };
  }
}
