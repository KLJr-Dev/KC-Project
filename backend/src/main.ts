import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * v0.4.1 -- Admin Endpoints & Weak Guards
 *
 * Application entry point. Creates the NestJS app, configures CORS and
 * Swagger, and starts listening on port 4000 (or PORT env var).
 *
 * Requires: docker compose -f infra/compose.yml up -d (PostgreSQL)
 *
 * v0.4.1: HasRoleGuard introduced (checks JWT role, trusts claim no DB re-check).
 * New admin endpoints: GET /admin/users, PUT /admin/users/:id/role
 * CWE-639 (Client-Controlled Authorization) extended — guard trusts JWT role
 * CWE-862 (Missing Authorization) extended — admin endpoints rely on weak guards
 * CWE-400 (Uncontrolled Resource Consumption) — /admin/users returns unbounded list
 * CWE-200 (Sensitive Info Exposure) — all user emails exposed to any admin
 *
 * Earlier VULNs still present: X-Powered-By header, public Swagger, no ValidationPipe, etc.
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
      'v0.4.1 -- Admin Endpoints & Weak Guards: HasRoleGuard added (trusts JWT role, no DB re-validation). Admin endpoints: GET /admin/users (unbounded list, all emails exposed), PUT /admin/users/:id/role (no audit trail). CWE-639, CWE-862, CWE-400, CWE-200 vulnerabilities intentional.',
    )
    .setVersion('0.4.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
