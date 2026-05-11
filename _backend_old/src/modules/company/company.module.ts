import { Module } from '@nestjs/common';
import { CompanyController, CompanyAuthController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  controllers: [CompanyController, CompanyAuthController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}

