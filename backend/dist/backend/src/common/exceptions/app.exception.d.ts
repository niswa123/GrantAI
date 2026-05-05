import { HttpException, HttpStatus } from '@nestjs/common';
export interface ErrorResponse {
    error: string;
    code: string;
    message: string;
}
export declare class AppException extends HttpException {
    constructor(error: string, code: string, message: string, status: HttpStatus);
}
export declare class NotFoundException extends AppException {
    constructor(resource: string);
}
export declare class ForbiddenException extends AppException {
    constructor();
}
export declare class ConflictException extends AppException {
    constructor(message: string);
}
