# Sharing DTOs — v0.0.6 Backend API Shape Definition

Request/response shapes for sharing routes. Stub only; validation minimal/absent.
All files exist to freeze API contract for v0.0.6.

**NestJS convention:** Same as admin/users: `dto/` holds types that cross the API boundary. Create/update/response pattern for share resources (links to files).

- `create-sharing.dto.ts` — POST /sharing/create body
- `update-sharing.dto.ts` — PUT /sharing/update/:id body
- `sharing-response.dto.ts` — response for read, get, create, update
