/**
 * Nest bootstrap — helmet, cookies, ValidationPipe, Swagger off in production.
 */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Helmet baseline headers (nginx/edge still authoritative at the tip)
  app.use(
    helmet({
      contentSecurityPolicy: false, // edge/Next own CSP
      crossOriginEmbedderPolicy: false,
    }),
  );

  const bodyLimit = process.env.JSON_BODY_LIMIT || '1mb';
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));
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

  const origins = (
    process.env.CORS_ORIGINS ||
    'https://127.0.0.1,https://localhost,http://127.0.0.1:8080,http://localhost:8080'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'X-Request-Id',
    ],
    exposedHeaders: ['X-Request-Id'],
    credentials: true,
  });

  const enableSwagger =
    process.env.ENABLE_SWAGGER === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.ENABLE_SWAGGER !== 'false');

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('KC-Project API')
      .setDescription('KC-Project HTTP API')
      .setVersion('2.10.1')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
