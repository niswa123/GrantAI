"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateExpenseDto = exports.CreateExpenseSchema = exports.ExpenseType = void 0;
const zod_1 = require("zod");
const nestjs_zod_1 = require("nestjs-zod");
exports.ExpenseType = zod_1.z.enum(['salary', 'contractor', 'tools', 'other']);
exports.CreateExpenseSchema = zod_1.z.object({
    type: exports.ExpenseType,
    amount: zod_1.z.number().positive(),
    currency: zod_1.z.string().length(3).toUpperCase(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    description: zod_1.z.string().min(1),
});
class CreateExpenseDto extends (0, nestjs_zod_1.createZodDto)(exports.CreateExpenseSchema) {
}
exports.CreateExpenseDto = CreateExpenseDto;
//# sourceMappingURL=expense.dto.js.map