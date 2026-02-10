# Users DTOs — v0.0.6 Backend API Shape Definition

Request/response shapes for users routes. Stub only; validation minimal/absent.
All files exist to freeze API contract for v0.0.6.

**NestJS convention:** Same as admin: `dto/` holds types that cross the API boundary. Create/update/response pattern; response never includes password.

- `create-user.dto.ts` — POST /users/create body
- `update-user.dto.ts` — PUT /users/update/:id body
- `user-response.dto.ts` — response for read, get, create, update (no password)
