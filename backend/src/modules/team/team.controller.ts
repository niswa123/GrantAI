import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TeamService } from './team.service';
import { ActivityLogService } from './activity-log.service';
import { CompanyRole, ActivityType } from '@prisma/client';

@Controller('team')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  // ==================== Team Management ====================

  @Get('companies/:companyId/members')
  async getCompanyMembers(@Param('companyId') companyId: string) {
    const members = await this.teamService.getCompanyMembers(companyId);
    return { members };
  }

  @Post('companies/:companyId/members')
  async inviteMember(
    @Param('companyId') companyId: string,
    @Body() body: { email: string; role: CompanyRole },
    @Req() req: Request,
  ) {
    const userId = (req.user as any).userId;

    const member = await this.teamService.inviteMember({
      companyId,
      email: body.email,
      role: body.role,
      invitedBy: userId,
    });

    // Log activity
    await this.activityLogService.log({
      companyId,
      userId,
      activityType: 'USER_INVITED',
      description: `Invited ${body.email} as ${body.role}`,
      metadata: { email: body.email, role: body.role },
    });

    return { member };
  }

  @Put('companies/:companyId/members/:userId/role')
  async updateMemberRole(
    @Param('companyId') companyId: string,
    @Param('userId') targetUserId: string,
    @Body() body: { role: CompanyRole },
    @Req() req: Request,
  ) {
    const userId = (req.user as any).userId;

    const member = await this.teamService.updateMemberRole({
      companyId,
      userId: targetUserId,
      role: body.role,
      updatedBy: userId,
    });

    // Log activity
    await this.activityLogService.log({
      companyId,
      userId,
      activityType: 'COMPANY_UPDATED',
      description: `Changed role of user to ${body.role}`,
      entityType: 'user',
      entityId: targetUserId,
      metadata: { newRole: body.role },
    });

    return { member };
  }

  @Delete('companies/:companyId/members/:userId')
  async removeMember(
    @Param('companyId') companyId: string,
    @Param('userId') targetUserId: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).userId;

    await this.teamService.removeMember(companyId, targetUserId, userId);

    // Log activity
    await this.activityLogService.log({
      companyId,
      userId,
      activityType: 'USER_REMOVED',
      description: `Removed user from company`,
      entityType: 'user',
      entityId: targetUserId,
    });

    return { message: 'Member removed successfully' };
  }

  @Post('companies/:companyId/leave')
  async leaveCompany(
    @Param('companyId') companyId: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).userId;

    await this.teamService.leaveCompany(companyId, userId);

    return { message: 'Left company successfully' };
  }

  @Post('companies/:companyId/transfer-ownership')
  async transferOwnership(
    @Param('companyId') companyId: string,
    @Body() body: { newOwnerId: string },
    @Req() req: Request,
  ) {
    const userId = (req.user as any).userId;

    await this.teamService.transferOwnership(
      companyId,
      body.newOwnerId,
      userId,
    );

    // Log activity
    await this.activityLogService.log({
      companyId,
      userId,
      activityType: 'COMPANY_UPDATED',
      description: `Transferred ownership to new owner`,
      entityType: 'user',
      entityId: body.newOwnerId,
      metadata: { previousOwner: userId, newOwner: body.newOwnerId },
    });

    return { message: 'Ownership transferred successfully' };
  }

  @Get('my-companies')
  async getMyCompanies(@Req() req: Request) {
    const userId = (req.user as any).userId;
    const companies = await this.teamService.getUserCompanies(userId);
    return { companies };
  }

  @Get('companies/:companyId/role')
  async getMyRole(
    @Param('companyId') companyId: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).userId;
    const role = await this.teamService.getUserRole(userId, companyId);
    return { role };
  }

  // ==================== Activity Logs ====================

  @Get('companies/:companyId/activity')
  async getActivityLogs(
    @Param('companyId') companyId: string,
    @Query('userId') userId?: string,
    @Query('activityType') activityType?: ActivityType,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.activityLogService.getActivityLogs({
      companyId,
      userId,
      activityType,
      entityType,
      entityId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return result;
  }

  @Get('companies/:companyId/activity/recent')
  async getRecentActivity(
    @Param('companyId') companyId: string,
    @Query('limit') limit?: string,
  ) {
    const logs = await this.activityLogService.getRecentActivity(
      companyId,
      limit ? parseInt(limit) : undefined,
    );

    return { logs };
  }

  @Get('companies/:companyId/activity/stats')
  async getActivityStats(
    @Param('companyId') companyId: string,
    @Query('days') days?: string,
  ) {
    const stats = await this.activityLogService.getActivityStats(
      companyId,
      days ? parseInt(days) : undefined,
    );

    return { stats };
  }

  @Get('companies/:companyId/activity/:entityType/:entityId')
  async getEntityActivity(
    @Param('companyId') companyId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const logs = await this.activityLogService.getEntityActivity(
      companyId,
      entityType,
      entityId,
    );

    return { logs };
  }
}
