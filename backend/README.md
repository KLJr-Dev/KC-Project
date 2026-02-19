# Backend

This directory contains the backend API for **KC-Project**.

The backend is implemented using **NestJS** and serves as the primary
application and trust boundary for the system. It is intentionally
developed in stages, with security controls introduced, omitted, and
later hardened according to the project roadmap.

---

## Current Status

**Version:** v0.4.0 (RBAC Introduction)

- NestJS 11 application with five domain modules (users, auth, files, sharing, admin)
- PostgreSQL 16 via Docker Compose (`infra/compose.yml`) — TypeORM repositories
- TypeORM migrations with `migrationsRun: true` (replaced `synchronize: true` in v0.2.5)
- Hardcoded DB credentials in source (CWE-798), SQL logging enabled (CWE-532)
- Registration, login, protected profile (`GET /auth/me`), cosmetic logout (`POST /auth/logout`)
- Real HS256 JWTs (hardcoded secret, no expiration — CWE-347, CWE-613)
- Role enum ('user'|'admin') in User entity, stored in JWT payload, default 'user' (v0.4.0)
- Role exposed in API responses, no server-side authorization enforcement (CWE-639, CWE-862)
- No rate limiting, no account lockout, no password requirements (CWE-307, CWE-521)
- Passwords stored/compared as plaintext in PostgreSQL (CWE-256)
- Sequential string IDs on all entities (CWE-330)
- Multipart file uploads via Multer, filesystem storage, public sharing (v0.3.x)
- OpenAPI/Swagger spec auto-generated via `@nestjs/swagger` CLI plugin (v0.4.0)
- TypeScript `strict: true`, Prettier enforced (shared root config)
- E2e tests (47) run against real PostgreSQL, unit tests (7) with mocked repos

---

## Running Locally

Requires Docker for PostgreSQL.

```bash
# Start PostgreSQL (from repo root)
docker compose -f infra/compose.yml up -d

# Start backend
cd backend
npm install
npm run start:dev
```

The server starts on `http://localhost:4000` by default.

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run start:dev` | Start in watch mode (development) |
| `npm run start` | Start without watch |
| `npm run build` | Compile TypeScript |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run e2e tests (requires PG running) |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run lint` | Run ESLint |

---

## Directory Structure

```
backend/
├── src/
│   ├── main.ts              # Bootstrap + Swagger setup
│   ├── app.module.ts         # Root module (TypeORM config + composition root)
│   ├── app.controller.ts     # /ping endpoint
│   ├── auth/                 # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.service.spec.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt-payload.interface.ts
│   │   ├── current-user.decorator.ts
│   │   └── dto/
│   ├── users/                # User management module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   ├── files/                # File metadata module
│   │   ├── files.module.ts
│   │   ├── files.controller.ts
│   │   ├── files.service.ts
│   │   ├── entities/
│   │   │   └── file.entity.ts
│   │   └── dto/
│   ├── sharing/              # Sharing module
│   │   ├── sharing.module.ts
│   │   ├── sharing.controller.ts
│   │   ├── sharing.service.ts
│   │   ├── entities/
│   │   │   └── sharing.entity.ts
│   │   └── dto/
│   └── admin/                # Admin module
│       ├── admin.module.ts
│       ├── admin.controller.ts
│       ├── admin.service.ts
│       ├── entities/
│       │   └── admin-item.entity.ts
│       └── dto/
├── test/
│   ├── app.e2e-spec.ts       # Ping e2e test
│   └── auth.e2e-spec.ts      # Auth e2e tests (18 tests)
├── nest-cli.json             # NestJS CLI config (Swagger plugin)
├── tsconfig.json             # TypeScript config (strict: true)
├── package.json
└── README.md                 # This file
```

---

## OpenAPI / Swagger

The backend auto-generates an OpenAPI 3.0 specification from DTO classes using the `@nestjs/swagger` CLI plugin (no manual `@ApiProperty()` decorators required).

- **Swagger UI:** `http://localhost:4000/api/docs`
- **JSON spec:** `http://localhost:4000/api/docs-json`

The frontend uses the JSON spec to auto-generate TypeScript types via `openapi-typescript`.

---

## API Routes

```
GET    /ping                  Infrastructure reachability check

POST   /users                 Create user
GET    /users                 List users
GET    /users/:id             Get user by ID
PUT    /users/:id             Update user
DELETE /users/:id             Delete user

POST   /auth/register         Register (public)
POST   /auth/login            Login (public)
GET    /auth/me               Get current user profile (protected)
POST   /auth/logout           Cosmetic logout (protected)

POST   /files                 Upload file metadata
GET    /files/:id             Get file metadata
DELETE /files/:id             Delete file

POST   /sharing               Create share
GET    /sharing               List shares
GET    /sharing/:id           Get share by ID
PUT    /sharing/:id           Update share
DELETE /sharing/:id           Delete share

POST   /admin                 Create admin item
GET    /admin                 List admin items
GET    /admin/:id             Get admin item by ID
PUT    /admin/:id             Update admin item
DELETE /admin/:id             Delete admin item
```

---

## Database

PostgreSQL 16 running in Docker (`infra/compose.yml`). Connection configured in `app.module.ts` with hardcoded credentials.

| Table | Entity | Primary Key |
|-------|--------|-------------|
| `user` | `User` | Manual sequential string (`"1"`, `"2"`, ...) |
| `file_entity` | `FileEntity` | Manual sequential string |
| `sharing_entity` | `SharingEntity` | Manual sequential string |
| `admin_item` | `AdminItem` | Manual sequential string |

No unique constraints, no foreign keys, no indices beyond primary keys. Schema auto-created by `synchronize: true`.
