import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  error: string;
  code: string;
  message: string;
}

export class AppException extends HttpException {
  constructor(error: string, code: string, message: string, status: HttpStatus) {
    const body: ErrorResponse = { error, code, message };
    super(body, status);
  }
}

export class NotFoundException extends AppException {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource.toUpperCase()}_NOT_FOUND`, `${resource} not found`, HttpStatus.NOT_FOUND);
  }
}

export class ForbiddenException extends AppException {
  constructor() {
    super('FORBIDDEN', 'FORBIDDEN_ACCESS', 'You do not have access to this resource', HttpStatus.FORBIDDEN);
  }
}

export class ConflictException extends AppException {
  constructor(message: string) {
    super('CONFLICT', 'RESOURCE_CONFLICT', message, HttpStatus.CONFLICT);
  }
}
