import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';
import { initializeSentry } from './common/monitoring/sentry.config';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Initialize Sentry
  initializeSentry(configService);

  // Global pipes and filters
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new SentryInterceptor());
  
  // API prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? '*',
    credentials: true,
  });

  // Sentry v8: auto-instrumentation is handled by Sentry.init() — no manual handlers needed.

  const port = process.env.PORT ?? 3001;
  const environment = process.env.NODE_ENV ?? 'development';
  
  await app.listen(port);
  
  console.log(`🚀 GrantAI API running on http://localhost:${port}/api/v1`);
  console.log(`📊 Environment: ${environment}`);
  console.log(`🔒 CORS enabled for: ${process.env.FRONTEND_URL ?? '*'}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  Sentry.captureException(error);
  process.exit(1);
});
