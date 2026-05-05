import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ExpenseType = z.enum(['salary', 'contractor', 'tools', 'other']);

export const CreateExpenseSchema = z.object({
  type: ExpenseType,
  amount: z.number().positive(),
  currency: z.string().length(3).toUpperCase(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  description: z.string().min(1),
});

export class CreateExpenseDto extends createZodDto(CreateExpenseSchema) {}
