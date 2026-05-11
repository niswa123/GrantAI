import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { ActivityLogService } from './activity-log.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [TeamController],
  providers: [TeamService, ActivityLogService],
  exports: [TeamService, ActivityLogService],
})
export class TeamModule {}
