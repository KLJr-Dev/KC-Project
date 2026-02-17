# ADR-018: Swagger CLI Plugin Over Manual Decorators

**Status:** Accepted

**Date:** v0.0.8 (Development Tooling Baseline)

---

## Context

`@nestjs/swagger` provides two ways to generate OpenAPI specs from NestJS code:

1. **Manual decorators** — Add `@ApiProperty()`, `@ApiOperation()`, `@ApiResponse()` etc. to every DTO field and controller method. Full control over descriptions, examples, and schema details.
2. **CLI plugin** — Enable the `@nestjs/swagger` plugin in `nest-cli.json`. The plugin introspects DTO class properties and controller return types at compile time, auto-generating the OpenAPI schema without any decorators.

## Decision

Use the **CLI plugin** for OpenAPI spec generation. No manual `@ApiProperty()` decorators on DTOs.

### How it works

The plugin is enabled in `nest-cli.json`:

```json
{
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}
```

At compile time, the plugin:

- Reads DTO class property declarations and their TypeScript types
- Infers `required` from `!:` (definite assignment) vs `?:` (optional)
- Generates OpenAPI schema entries for each property
- Picks up controller return types and maps them to response schemas

The generated spec is served at `/api/docs` (Swagger UI) and `/api/docs-json` (raw JSON).

### Why CLI plugin over manual decorators

1. **Clean DTOs** — DTO classes contain only property declarations. No decorator noise. A DTO looks like a plain TypeScript class, which is easier to read and maintain.
2. **Single source of truth** — The TypeScript type IS the schema. If you change a property type, the OpenAPI spec updates automatically. No risk of decorators drifting from the actual types.
3. **Less boilerplate** — With 5 domain modules and ~15 DTOs, manual decorators would add 3-5 lines per field. The plugin eliminates all of it.
4. **Codegen compatibility** — The generated spec feeds into `openapi-typescript` for frontend type generation (ADR-004). The plugin produces clean, consistent schemas that codegen handles well.

### Trade-offs

- **Less granular control** — Cannot add custom descriptions, examples, or enum documentation per-field without falling back to decorators. Acceptable — the spec is for type generation and API exploration, not public documentation.
- **Compile-time dependency** — The plugin hooks into the NestJS compiler. If the plugin has bugs or version incompatibilities, it affects the build. Not seen in practice.
- **Implicit behaviour** — Developers must know the plugin exists to understand why the spec works without decorators. Documented here and in the codebase README.

### What still needs manual decorators

- `PingResponse` and `DeleteResponse` are inline return types (not DTO classes), so the plugin can't introspect them. These are manually defined in the frontend's `types.ts` as noted in ADR-004.
- If we later need response examples or detailed descriptions (e.g. for a public API), specific fields can add `@ApiProperty()` alongside the plugin. They coexist.

## Consequences

- **Positive:** DTOs are clean TypeScript classes. No framework-specific decorator clutter.
- **Positive:** OpenAPI spec is always in sync with the actual code. Zero maintenance.
- **Positive:** Frontend codegen pipeline (ADR-004) works seamlessly with the generated spec.
- **Negative:** Can't add rich documentation (descriptions, examples) to the spec without decorators.
- **Negative:** Plugin behaviour is implicit — new contributors might not understand why the spec works without decorators.
