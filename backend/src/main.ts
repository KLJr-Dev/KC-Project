import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * v0.1.4 — Logout & Token Misuse
 *
 * Application entry point. Creates the NestJS app, configures CORS and
 * Swagger, and starts listening on port 4000 (or PORT env var).
 *
 * This file is the first thing that runs when the backend starts. It:
 *   1. Creates the NestJS application from AppModule (the root module)
 *   2. Enables CORS (permissive — all origins allowed)
 *   3. Builds the OpenAPI/Swagger document from controller metadata
 *   4. Mounts the Swagger UI at /api/docs
 *   5. Starts the HTTP server
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * VULN (v0.0.5): enableCors() with no options allows ALL origins,
   * ALL methods, and ALL headers. Any website can make authenticated
   * requests to this API if the user has a valid token in localStorage.
   * CWE-942 (Overly Permissive Cross-domain Whitelist) | A05:2021 Security Misconfiguration
   * Remediation (v2.0.0): Restrict origin to the frontend's domain,
   * limit methods to GET/POST/PUT/DELETE, set credentials: true with
   * explicit allowedHeaders.
   */
  app.enableCors();

  // OpenAPI/Swagger spec — auto-generated from controller/DTO metadata
  // via @nestjs/swagger CLI plugin (see ADR-018)
  const config = new DocumentBuilder()
    .setTitle('KC-Project API')
    .setDescription(
      'v0.1.4 — Logout & Token Misuse: cosmetic logout, no token revocation (CWE-613)',
    )
    .setVersion('0.1.4')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
