import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ActivityType, ActivityLog } from '@prisma/client';

export interface CreateActivityLogDto {
  companyId: string;
  userId: string;
  activityType: ActivityType;
  description: string;
  entityType?: string;
  entityId?: string;
  metadata?: any;
}

export interface ActivityLogFilters {
  companyId: string;
  userId?: string;
  activityType?: ActivityType;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create activity log entry
   */
  async log(data: CreateActivityLogDto): Promise<ActivityLog> {
    return this.prisma.activityLog.create({
      data: {
        company_id: data.companyId,
        user_id: data.userId,
        activity_type: data.activityType,
        description: data.description,
        entity_type: data.entityType,
        entity_id: data.entityId,
        metadata: data.metadata,
      },
    });
  }

  /**
   * Get activity logs with filters
   */
  async getActivityLogs(filters: ActivityLogFilters) {
    const where: any = {
      company_id: filters.companyId,
    };

    if (filters.userId) {
      where.user_id = filters.userId;
    }

    if (filters.activityType) {
      where.activity_type = filters.activityType;
    }

    if (filters.entityType) {
      where.entity_type = filters.entityType;
    }

    if (filters.entityId) {
      where.entity_id = filters.entityId;
    }

    if (filters.startDate || filters.endDate) {
      where.created_at = {};
      if (filters.startDate) {
        where.created_at.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.created_at.lte = filters.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };
  }

  /**
   * Get recent activity for a company
   */
  async getRecentActivity(companyId: string, limit: number = 20) {
    return this.prisma.activityLog.findMany({
      where: { company_id: companyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  /**
   * Get activity for specific entity
   */
  async getEntityActivity(
    companyId: string,
    entityType: string,
    entityId: string,
  ) {
    return this.prisma.activityLog.findMany({
      where: {
        company_id: companyId,
        entity_type: entityType,
        entity_id: entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(companyId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.prisma.activityLog.findMany({
      where: {
        company_id: companyId,
        created_at: {
          gte: startDate,
        },
      },
      select: {
        activity_type: true,
        user_id: true,
        created_at: true,
      },
    });

    // Group by activity type
    const byType: Record<string, number> = {};
    logs.forEach((log) => {
      byType[log.activity_type] = (byType[log.activity_type] || 0) + 1;
    });

    // Group by user
    const byUser: Record<string, number> = {};
    logs.forEach((log) => {
      byUser[log.user_id] = (byUser[log.user_id] || 0) + 1;
    });

    // Group by day
    const byDay: Record<string, number> = {};
    logs.forEach((log) => {
      const day = log.created_at.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

    return {
      total: logs.length,
      byType,
      byUser,
      byDay,
      period: {
        start: startDate,
        end: new Date(),
        days,
      },
    };
  }

  /**
   * Delete old activity logs (cleanup)
   */
  async cleanupOldLogs(companyId: string, daysToKeep: number = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.activityLog.deleteMany({
      where: {
        company_id: companyId,
        created_at: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}
