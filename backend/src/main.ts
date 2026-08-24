import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * M6: cookie-parser enables req.cookies for httpOnly refresh; CORS credentials
 * already enabled so the SPA can send/receive Set-Cookie on /api/auth/*.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: false,
      skipMissingProperties: false,
    }),
  );

  app.useGlobalFilters(new ValidationExceptionFilter(), new HttpExceptionFilter());

  const origins = (process.env.CORS_ORIGINS || 'http://127.0.0.1:8080,http://localhost:8080')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
    credentials: true,
  });

  const enableSwagger =
    process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV !== 'production';

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('KC-Project API')
      .setDescription('KC-Project HTTP API')
      .setVersion('2.1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
