# ADR-023: Error Handling Philosophy (Insecure by Design)

## Status

Accepted

## Context

NestJS provides a default `ExceptionsHandler` that catches all unhandled exceptions. Its behaviour:

- **Known HTTP exceptions** (e.g. `NotFoundException`, `ConflictException`): Returns the exception's status code and message to the client.
- **Unknown exceptions** (e.g. plain `Error`, `TypeError`, TypeORM `QueryFailedError`): Returns `{"statusCode":500,"message":"Internal server error"}` to the client, but logs the **full stack trace** (including file paths, line numbers, and error details) to stdout.

This means:
1. The client gets a generic 500 (no stack trace in the HTTP response).
2. Server logs contain full error details including PG table names, constraint names, SQL with parameters, and file system paths.
3. No structured error classification, no retry logic, no circuit breakers.

## Decision

Intentionally keep the NestJS default exception handler with no global exception filter, no error sanitisation, and no structured error responses. This is the v0.2.4 "Error & Metadata Leakage" surface.

A deliberate crash-test endpoint (`GET /admin/crash-test`) is provided to demonstrate the behaviour.

## OWASP and CWE Mapping

- **A10:2025 Mishandling of Exceptional Conditions** — First use of this new OWASP 2025 category. The application fails open: unhandled errors crash the request handler, leak implementation details to logs, and provide no recovery path.
- **CWE-209** (Error Message Containing Sensitive Information) — Stack traces with file paths and DB details in logs.
- **CWE-532** (Sensitive Info in Logs) — TypeORM `logging: true` prints all SQL including INSERT with plaintext passwords.

## v2.0.0 Remediation

- Global `ExceptionFilter` that catches all errors
- Structured error responses with correlation IDs
- Stack traces stripped from all outputs (logs get sanitised messages)
- TypeORM logging disabled or sensitive fields redacted
- `ValidationPipe` with `whitelist` and `forbidNonWhitelisted` to reject malformed input before it reaches services

## Consequences

- Any unhandled exception leaks file paths and DB details to stdout
- Malformed input is not rejected at the API boundary
- Non-existent routes reveal the NestJS error response shape
- The crash-test endpoint is available to any authenticated user (CWE-862 still applies)
