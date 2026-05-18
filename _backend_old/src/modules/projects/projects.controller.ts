import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@UseGuards(JwtAuthGuard)
@Controller('company/:companyId/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Param('companyId') companyId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user.sub, companyId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param('companyId') companyId: string) {
    return this.projectsService.findAll(user.sub, companyId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.projectsService.findOne(user.sub, companyId, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('companyId') companyId: string, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(user.sub, companyId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.projectsService.remove(user.sub, companyId, id);
  }
}
