"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCompanyDto = exports.UpdateCompanySchema = exports.CreateCompanyDto = exports.CreateCompanySchema = void 0;
const zod_1 = require("zod");
const nestjs_zod_1 = require("nestjs-zod");
exports.CreateCompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    country: zod_1.z.string().min(2).max(100),
    industry: zod_1.z.string().min(1).max(100),
});
class CreateCompanyDto extends (0, nestjs_zod_1.createZodDto)(exports.CreateCompanySchema) {
}
exports.CreateCompanyDto = CreateCompanyDto;
exports.UpdateCompanySchema = exports.CreateCompanySchema.partial();
class UpdateCompanyDto extends (0, nestjs_zod_1.createZodDto)(exports.UpdateCompanySchema) {
}
exports.UpdateCompanyDto = UpdateCompanyDto;
//# sourceMappingURL=company.dto.js.map