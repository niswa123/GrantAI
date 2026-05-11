"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProjectDto = exports.UpdateProjectSchema = exports.CreateProjectDto = exports.CreateProjectSchema = void 0;
const zod_1 = require("zod");
const nestjs_zod_1 = require("nestjs-zod");
exports.CreateProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().min(1),
});
class CreateProjectDto extends (0, nestjs_zod_1.createZodDto)(exports.CreateProjectSchema) {
}
exports.CreateProjectDto = CreateProjectDto;
exports.UpdateProjectSchema = exports.CreateProjectSchema.partial();
class UpdateProjectDto extends (0, nestjs_zod_1.createZodDto)(exports.UpdateProjectSchema) {
}
exports.UpdateProjectDto = UpdateProjectDto;
//# sourceMappingURL=project.dto.js.map