/**
 * Shared Nest e2e bootstrap helpers.
 *
 * Mirrors production `main.ts` ValidationPipe + ValidationExceptionFilter so
 * DTO security controls (e.g. M5 password policy) are exercised in tests that
 * do not boot via NestFactory.create in main().
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ValidationExceptionFilter } from '../src/common/filters/validation-exception.filter';

export function configureE2eApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: false,
      skipMissingProperties: false,
    }),
  );
  app.useGlobalFilters(new ValidationExceptionFilter());
}
