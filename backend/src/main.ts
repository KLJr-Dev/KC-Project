import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // v0.0.5 — Allow all origins (intentionally permissive)
  app.enableCors();

  // v0.0.8 — OpenAPI/Swagger spec
  const config = new DocumentBuilder()
    .setTitle('KC-Project API')
    .setDescription('v0.0.8 — Backend API with auto-generated OpenAPI spec')
    .setVersion('0.0.8')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
