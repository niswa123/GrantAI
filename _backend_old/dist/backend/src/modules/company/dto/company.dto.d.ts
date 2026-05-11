import { z } from 'zod';
export declare const CreateCompanySchema: z.ZodObject<{
    name: z.ZodString;
    country: z.ZodString;
    industry: z.ZodString;
}, z.core.$strip>;
declare const CreateCompanyDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    name: z.ZodString;
    country: z.ZodString;
    industry: z.ZodString;
}, z.core.$strip>, false>;
export declare class CreateCompanyDto extends CreateCompanyDto_base {
}
export declare const UpdateCompanySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const UpdateCompanyDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, false>;
export declare class UpdateCompanyDto extends UpdateCompanyDto_base {
}
export {};
