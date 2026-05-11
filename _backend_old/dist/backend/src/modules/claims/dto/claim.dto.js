"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateClaimDto = exports.GenerateClaimSchema = void 0;
const zod_1 = require("zod");
const nestjs_zod_1 = require("nestjs-zod");
exports.GenerateClaimSchema = zod_1.z.object({
    company_id: zod_1.z.string().uuid(),
});
class GenerateClaimDto extends (0, nestjs_zod_1.createZodDto)(exports.GenerateClaimSchema) {
}
exports.GenerateClaimDto = GenerateClaimDto;
//# sourceMappingURL=claim.dto.js.map