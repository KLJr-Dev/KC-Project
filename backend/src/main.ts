import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // v0.0.5 — Allow all origins (intentionally permissive)
  app.enableCors();

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();