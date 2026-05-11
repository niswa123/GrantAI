import { z } from 'zod';
export declare const CreateProjectSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
}, z.core.$strip>;
declare const CreateProjectDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
}, z.core.$strip>, false>;
export declare class CreateProjectDto extends CreateProjectDto_base {
}
export declare const UpdateProjectSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const UpdateProjectDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, false>;
export declare class UpdateProjectDto extends UpdateProjectDto_base {
}
export {};
