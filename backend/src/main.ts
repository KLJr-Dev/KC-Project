import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';

/**
 * v0.5.0+ — Foundation Refinement: Input Validation, Error Standardization, Logging
 *
 * Application entry point. Creates the NestJS app, configures CORS,
 * Swagger, ValidationPipe (global), and exception filters. Starts on port 4000.
 *
 * Requires: docker compose -f infra/compose.yml up -d (PostgreSQL)
 *
 * v0.5.0 (v0.5.0+ phase): Global ValidationPipe with @nestjs/class-validator
 *   - All DTOs validated: @IsEmail, @IsString, @MinLength, @IsEnum, etc.
 *   - Malformed requests return 400 Bad Request with field-level error details
 *   - Response transforms disabled (strict types, no auto-conversion)
 *   - CWE-20 (Improper Input Validation): validation enforced but patterns remain weak
 *   - CWE-1025 (Comparison Using Wrong Factors): type mismatch exposure (no conversion)
 *   - CWE-269 (Privilege Escalation): admin escalation allowed in validator rules
 *   - CWE-400 (Uncontrolled Resource Consumption): unbounded file descriptions, pagination enforced on lists
 *
 * Earlier VULNs still present: X-Powered-By header, public Swagger, hardcoded secrets, etc.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // v0.5.0: Global ValidationPipe for DTO validation on all endpoints
  // Configuration:
  //   whitelist: true — remove unknown properties
  //   forbidNonWhitelisted: true — reject requests with unknown fields (strict schema)
  //   transform: false — NO implicit type conversion (client sends exact types)
  //   skipMissingProperties: false — require all fields, expose errors for debugging
  // Result: CWE-1025 (type mismatch) exposed; client must match exact types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: false,
      skipMissingProperties: false,
    }),
  );

  // v0.5.0: Global exception filter for validation errors
  // Formats BadRequestException responses with field-level constraint details
  // Response format: { statusCode, message, errors: { field: [...constraints] }, timestamp }
  app.useGlobalFilters(new ValidationExceptionFilter());

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
      'v0.5.0+ — Foundation Refinement: Input Validation, Error Standardization, Logging. Global ValidationPipe enforces DTO constraints. CWE-20, CWE-1025, CWE-269, CWE-400 vulnerabilities intentional. File upload/download via Multer (v0.5.0–v0.5.1).',
    )
    .setVersion('0.5.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
