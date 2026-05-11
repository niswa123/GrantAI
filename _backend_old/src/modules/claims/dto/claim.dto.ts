import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const GenerateClaimSchema = z.object({
  company_id: z.string().uuid(),
});
export class GenerateClaimDto extends createZodDto(GenerateClaimSchema) {}
