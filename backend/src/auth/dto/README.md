# Auth DTOs — v0.0.6 Backend API Shape Definition

Request/response shapes for auth routes. Stub only; validation minimal/absent.
All files exist to freeze API contract for v0.0.6.

**NestJS convention:** Same as admin: `dto/` holds types that cross the API boundary. Auth uses distinct request DTOs per route (register vs login) and one shared response DTO.

- `register.dto.ts` — POST /auth/register body
- `login.dto.ts` — POST /auth/login body
- `auth-response.dto.ts` — response for register and login (token, userId, message)
