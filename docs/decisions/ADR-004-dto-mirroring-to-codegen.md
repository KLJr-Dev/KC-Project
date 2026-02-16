# ADR-004: Manual DTO Mirroring Then OpenAPI Codegen

**Status:** Accepted (superseded manual approach)

**Date:** v0.0.7 (manual mirroring) → v0.0.8 (codegen)

---

## Context

The frontend needs TypeScript types that match backend DTOs. Three approaches exist:

1. **Manual mirroring** — Write frontend interfaces by hand, matching backend classes.
2. **Shared package** — A monorepo `packages/types` directory imported by both projects.
3. **Code generation** — Backend generates an OpenAPI spec; frontend generates types from it.

## Decision

Start with **manual mirroring** in v0.0.7, then replace with **OpenAPI codegen** in v0.0.8.

### v0.0.7: Manual mirroring

`frontend/lib/types.ts` contained hand-written interfaces matching every backend DTO. This was pragmatic for 6 DTOs and reflected how most REST projects start.

### v0.0.8: OpenAPI codegen

- `@nestjs/swagger` with the CLI plugin auto-detects DTO properties from class declarations (no `@ApiProperty()` decorators needed).
- `openapi-typescript` generates `frontend/lib/types.gen.ts` from the spec.
- `frontend/lib/types.ts` became a thin re-export layer with friendly aliases (`UserResponse` instead of `components['schemas']['UserResponseDto']`).

The shared package approach was rejected because it adds monorepo build complexity (workspace linking, shared build step) without clear benefit at this scale.

## Consequences

- **Positive:** Types are always derivable from the backend's actual shape. No manual sync needed.
- **Positive:** The re-export layer keeps all existing imports stable.
- **Positive:** Swagger UI at `/api/docs` is a free bonus for API exploration.
- **Negative:** Codegen requires the backend to be running (`npm run generate:types` fetches from `:4000`).
- **Negative:** `PingResponse` and `DeleteResponse` are still manually defined (not captured as DTOs by Swagger since they're inline return types, not DTO classes).
