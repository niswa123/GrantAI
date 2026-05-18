import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubmissionsService } from './submissions.service';
import { ExportService } from './export.service';

@Controller('submissions')
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
  constructor(
    private readonly submissionsService: SubmissionsService,
    private readonly exportService: ExportService,
  ) {}

  // Controller endpoints will be added here
}
