import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { COUNTRY_TAX_RULES } from '../analysis/tax-rules.registry';

/** Public — no auth required. Used for country selector in registration forms. */
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('supported-countries')
  getSupportedCountries() {
    return Object.values(COUNTRY_TAX_RULES)
      .filter((r) => r.countryCode !== 'DEFAULT')
      .map((r) => ({
        code: r.countryCode,
        name: r.countryName,
        program: r.programName,
        currency: r.currency,
        baseCreditRate: r.baseCreditRate,
        notes: r.notes,
      }));
  }
}

@UseGuards(JwtAuthGuard)
@Controller('company')
export class CompanyAuthController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCompanyDto) {
    return this.companyService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.companyService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.companyService.findOne(user.sub, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.companyService.remove(user.sub, id);
  }
}

