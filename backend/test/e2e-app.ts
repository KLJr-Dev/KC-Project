/**
 * Shared Nest e2e bootstrap helpers.
 *
 * Mirrors production `main.ts` ValidationPipe + ValidationExceptionFilter +
 * cookie-parser so M5 password policy and M6 httpOnly refresh cookies work
 * under Jest the same way they do behind nginx.
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ValidationExceptionFilter } from '../src/common/filters/validation-exception.filter';

export function configureE2eApp(app: INestApplication): void {
  // Direct Nest HTTP has no `/api` prefix (unlike nginx).
  if (!process.env.REFRESH_COOKIE_PATH) {
    process.env.REFRESH_COOKIE_PATH = '/auth';
  }
  app.use(cookieParser());
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
