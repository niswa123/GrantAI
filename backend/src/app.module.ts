import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { ClaimsModule } from './modules/claims/claims.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { TeamModule } from './modules/team/team.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { QueueModule } from './common/queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    QueueModule,
    PrismaModule,
    AuthModule,
    CompanyModule,
    ProjectsModule,
    ExpensesModule,
    AnalysisModule,
    ClaimsModule,
    AnalyticsModule,
    IntegrationsModule,
    TeamModule,
    SubmissionsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
