import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: object = {
      error: 'INTERNAL_SERVER_ERROR',
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'error' in exceptionResponse) {
        body = exceptionResponse;
      } else {
        body = {
          error: 'HTTP_EXCEPTION',
          code: `HTTP_${status}`,
          message:
            typeof exceptionResponse === 'string'
              ? exceptionResponse
              : (exceptionResponse as { message?: string })?.message ?? 'Request failed',
        };
      }
    }

    this.logger.error(
      `${request.method} ${request.url} → ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json(body);
  }
}
