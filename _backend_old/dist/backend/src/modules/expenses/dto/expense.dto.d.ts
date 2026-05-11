import { z } from 'zod';
export declare const ExpenseType: z.ZodEnum<{
    salary: "salary";
    contractor: "contractor";
    tools: "tools";
    other: "other";
}>;
export declare const CreateExpenseSchema: z.ZodObject<{
    type: z.ZodEnum<{
        salary: "salary";
        contractor: "contractor";
        tools: "tools";
        other: "other";
    }>;
    amount: z.ZodNumber;
    currency: z.ZodString;
    date: z.ZodString;
    description: z.ZodString;
}, z.core.$strip>;
declare const CreateExpenseDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    type: z.ZodEnum<{
        salary: "salary";
        contractor: "contractor";
        tools: "tools";
        other: "other";
    }>;
    amount: z.ZodNumber;
    currency: z.ZodString;
    date: z.ZodString;
    description: z.ZodString;
}, z.core.$strip>, false>;
export declare class CreateExpenseDto extends CreateExpenseDto_base {
}
export {};
