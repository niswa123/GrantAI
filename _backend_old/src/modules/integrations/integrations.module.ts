import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { GithubService } from './services/github.service';
import { JiraService } from './services/jira.service';
import { ProjectSyncService } from './services/project-sync.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    GithubService,
    JiraService,
    ProjectSyncService,
  ],
  exports: [
    IntegrationsService,
    GithubService,
    JiraService,
    ProjectSyncService,
  ],
})
export class IntegrationsModule {}
