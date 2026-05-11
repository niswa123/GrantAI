"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictException = exports.ForbiddenException = exports.NotFoundException = exports.AppException = void 0;
const common_1 = require("@nestjs/common");
class AppException extends common_1.HttpException {
    constructor(error, code, message, status) {
        const body = { error, code, message };
        super(body, status);
    }
}
exports.AppException = AppException;
class NotFoundException extends AppException {
    constructor(resource) {
        super('NOT_FOUND', `${resource.toUpperCase()}_NOT_FOUND`, `${resource} not found`, common_1.HttpStatus.NOT_FOUND);
    }
}
exports.NotFoundException = NotFoundException;
class ForbiddenException extends AppException {
    constructor() {
        super('FORBIDDEN', 'FORBIDDEN_ACCESS', 'You do not have access to this resource', common_1.HttpStatus.FORBIDDEN);
    }
}
exports.ForbiddenException = ForbiddenException;
class ConflictException extends AppException {
    constructor(message) {
        super('CONFLICT', 'RESOURCE_CONFLICT', message, common_1.HttpStatus.CONFLICT);
    }
}
exports.ConflictException = ConflictException;
//# sourceMappingURL=app.exception.js.map