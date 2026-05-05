import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/expense.dto';

@UseGuards(JwtAuthGuard)
@Controller('company/:companyId/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Param('companyId') companyId: string, @Body() dto: CreateExpenseDto) {
    return this.expensesService.create(user.sub, companyId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param('companyId') companyId: string) {
    return this.expensesService.findAll(user.sub, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.expensesService.remove(user.sub, companyId, id);
  }
}
