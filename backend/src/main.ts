import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * v0.2.4 — Error & Metadata Leakage
 *
 * Application entry point. Creates the NestJS app, configures CORS and
 * Swagger, and starts listening on port 4000 (or PORT env var).
 *
 * Requires: docker compose -f infra/compose.yml up -d (PostgreSQL)
 *
 * VULN (v0.2.3): Express sends X-Powered-By: Express header by default.
 *       Reveals the backend framework to any client. app.disable('x-powered-by')
 *       is intentionally not called.
 *       CWE-200 (Exposure of Sensitive Information) | A02:2025
 *       Remediation (v2.0.0): helmet() middleware or app.disable('x-powered-by').
 *
 * VULN (v0.2.3): Swagger UI and JSON spec are publicly accessible at
 *       /api/docs and /api/docs-json without any authentication. Reveals
 *       every route, DTO shape, parameter type, and response schema to
 *       unauthenticated users — full API reconnaissance.
 *       CWE-200 (Exposure of Sensitive Information) | A02:2025
 *       Remediation (v2.0.0): Disable Swagger in production or protect
 *       behind authentication.
 *
 * VULN (v0.2.4): No ValidationPipe is registered. Malformed request
 *       bodies (wrong types, missing fields) pass through to services
 *       unchecked and may cause TypeErrors with stack traces in logs.
 *       app.useGlobalPipes(new ValidationPipe()) is intentionally omitted.
 *       CWE-209 (Error Message Info Leak) | A10:2025
 *       Remediation (v2.0.0): Global ValidationPipe with whitelist and
 *       forbidNonWhitelisted options.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * VULN (v0.0.5): enableCors() with no options allows ALL origins,
   * ALL methods, and ALL headers. Any website can make authenticated
   * requests to this API if the user has a valid token in localStorage.
   * CWE-942 (Overly Permissive Cross-domain Whitelist) | A02:2025 Security Misconfiguration
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
      'v0.2.4 — Error & Metadata Leakage: crash-test endpoint, no ValidationPipe, NestJS error shape leaked, SQL logging with plaintext data (CWE-209, CWE-532, A10:2025)',
    )
    .setVersion('0.2.4')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
