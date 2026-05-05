import { z } from 'zod';
export declare const GenerateClaimSchema: z.ZodObject<{
    company_id: z.ZodString;
}, z.core.$strip>;
declare const GenerateClaimDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    company_id: z.ZodString;
}, z.core.$strip>, false>;
export declare class GenerateClaimDto extends GenerateClaimDto_base {
}
export {};
