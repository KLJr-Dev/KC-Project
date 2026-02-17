import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * v0.2.2 — Identifier Trust Failures
 *
 * Application entry point. Creates the NestJS app, configures CORS and
 * Swagger, and starts listening on port 4000 (or PORT env var).
 *
 * Requires: docker compose -f infra/compose.yml up -d (PostgreSQL)
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
      'v0.2.2 — Identifier Trust Failures: JwtAuthGuard on all resources, ownerId tracked but never enforced, IDOR across all endpoints (CWE-639, CWE-862)',
    )
    .setVersion('0.2.2')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
