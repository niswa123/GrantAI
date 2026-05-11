"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginDto = exports.LoginSchema = exports.RegisterDto = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
const nestjs_zod_1 = require("nestjs-zod");
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: 'Invalid email address' }),
    password: zod_1.z
        .string()
        .min(8, { message: 'Password must be at least 8 characters' })
        .max(100),
});
class RegisterDto extends (0, nestjs_zod_1.createZodDto)(exports.RegisterSchema) {
}
exports.RegisterDto = RegisterDto;
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
class LoginDto extends (0, nestjs_zod_1.createZodDto)(exports.LoginSchema) {
}
exports.LoginDto = LoginDto;
//# sourceMappingURL=auth.dto.js.map