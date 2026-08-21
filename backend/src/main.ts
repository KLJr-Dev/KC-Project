import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: false,
      skipMissingProperties: false,
    }),
  );

  app.useGlobalFilters(new ValidationExceptionFilter(), new HttpExceptionFilter());

  /**
   * CORS remains open until M4 (F-07).
   */
  app.enableCors();

  const enableSwagger =
    process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV !== 'production';

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('KC-Project API')
      .setDescription('KC-Project HTTP API')
      .setVersion('2.0.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
