# Admin DTOs — v0.0.6 Backend API Shape Definition

Request/response shapes for admin routes. Stub only; validation minimal/absent.
All files in this folder exist to freeze API contract for v0.0.6.

**NestJS convention:** Each feature module has a `dto/` folder for types that cross the API boundary. We use classes (not raw interfaces) so Nest can bind request bodies to them and we can add validation decorators later. Naming: `create-*.dto.ts` for create payloads, `update-*.dto.ts` for updates, `*-response.dto.ts` for responses.

- `create-admin.dto.ts` — POST /admin/create body
- `update-admin.dto.ts` — PUT /admin/update/:id body
- `admin-response.dto.ts` — response for read, get, create, update