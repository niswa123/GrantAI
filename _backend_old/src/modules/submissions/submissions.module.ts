import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { ExportService } from './export.service';
import { FormattersModule } from './formatters/formatters.module';

@Module({
  imports: [ConfigModule, PrismaModule, FormattersModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, ExportService],
  exports: [SubmissionsService, ExportService],
})
export class SubmissionsModule {}
