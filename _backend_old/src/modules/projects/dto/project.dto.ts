import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateProjectSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
});

export class CreateProjectDto extends createZodDto(CreateProjectSchema) {}

export const UpdateProjectSchema = CreateProjectSchema.partial();
export class UpdateProjectDto extends createZodDto(UpdateProjectSchema) {}
