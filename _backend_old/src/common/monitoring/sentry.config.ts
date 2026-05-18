import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { ConfigService } from '@nestjs/config';

/**
 * Sentry Configuration for Production Monitoring
 * 
 * Features:
 * - Error tracking
 * - Performance monitoring
 * - Profiling
 * - Custom context (user, company, request)
 */

export function initializeSentry(configService: ConfigService) {
  const sentryDsn = configService.get<string>('SENTRY_DSN');
  const environment = configService.get<string>('NODE_ENV', 'development');
  const release = configService.get<string>('APP_VERSION', '1.0.0');

  if (!sentryDsn) {
    console.warn('⚠️  SENTRY_DSN not configured. Error monitoring disabled.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,
    release: `grantai-backend@${release}`,

    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Profiling
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
    integrations: [
      nodeProfilingIntegration(),
    ],

    // Error filtering
    beforeSend(event, hint) {
      // Don't send validation errors to Sentry
      if (event.exception?.values?.[0]?.type === 'ValidationError') {
        return null;
      }

      // Don't send 401/403 errors
      if (event.tags?.['http.status_code'] === '401' || event.tags?.['http.status_code'] === '403') {
        return null;
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      'ValidationError',
      'UnauthorizedException',
      'ForbiddenException',
      'NotFoundException',
    ],
  });

  console.log(`✅ Sentry initialized (${environment})`);
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email,
  });
}

/**
 * Set company context for Sentry
 */
export function setSentryCompanyContext(companyId: string, companyName?: string) {
  Sentry.setContext('company', {
    id: companyId,
    name: companyName,
  });
}

/**
 * Clear Sentry context (e.g., after request)
 */
export function clearSentryContext() {
  Sentry.setUser(null);
  Sentry.setContext('company', null);
}

/**
 * Capture custom event
 */
export function captureEvent(message: string, level: Sentry.SeverityLevel = 'info', extra?: Record<string, any>) {
  Sentry.captureMessage(message, {
    level,
    extra,
  });
}

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Start a performance span (Sentry v8 API)
 */
export function startSpan<T>(name: string, op: string, callback: () => T): T {
  return Sentry.startSpan(
    { name, op },
    callback,
  );
}
