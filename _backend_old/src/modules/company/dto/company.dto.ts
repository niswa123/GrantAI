import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateCompanySchema = z.object({
  name: z.string().min(1).max(255),
  country: z.string().min(2).max(100),
  industry: z.string().min(1).max(100),
});

export class CreateCompanyDto extends createZodDto(CreateCompanySchema) {}

export const UpdateCompanySchema = CreateCompanySchema.partial();
export class UpdateCompanyDto extends createZodDto(UpdateCompanySchema) {}
