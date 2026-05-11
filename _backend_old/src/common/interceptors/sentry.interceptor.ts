import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import * as Sentry from '@sentry/node';
import { setSentryUser, setSentryCompanyContext, clearSentryContext } from '../monitoring/sentry.config';

/**
 * Sentry Interceptor (v8 API)
 * 
 * Automatically:
 * - Sets user context from JWT
 * - Sets company context from request params
 * - Captures exceptions
 * - Clears context after request
 * 
 * Note: In Sentry v8, performance monitoring is auto-instrumented via Sentry.init().
 * Manual transaction/span creation is no longer needed for HTTP requests.
 */
@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, params } = request;

    // Set user context if authenticated
    if (user?.sub) {
      setSentryUser(user.sub, user.email);
    }

    // Set company context if present in params
    if (params?.companyId) {
      setSentryCompanyContext(params.companyId);
    }

    // Add request metadata
    Sentry.setContext('request', {
      method,
      url,
      headers: {
        'user-agent': request.headers['user-agent'],
        'content-type': request.headers['content-type'],
      },
      query: request.query,
      params: request.params,
    });

    return next.handle().pipe(
      tap(() => {
        clearSentryContext();
      }),
      catchError((error) => {
        // Capture exception with context
        Sentry.captureException(error, {
          extra: {
            method,
            url,
            userId: user?.sub,
            companyId: params?.companyId,
          },
        });

        clearSentryContext();
        return throwError(() => error);
      }),
    );
  }
}
