# Backend

This directory contains the backend API for **KC-Project**.

The backend is implemented using **NestJS** and serves as the primary
application and trust boundary for the system. It is intentionally
developed in stages, with security controls introduced, omitted, and
later hardened according to the project roadmap.

---

## Current Status

**Version:** v0.1.0 (Identity surface begins)

- NestJS 11 application with five domain modules (users, auth, files, sharing, admin)
- `User` entity defined — service stores entities internally, maps to DTOs at boundary
- Password stored in plaintext on User entity (intentionally insecure)
- RESTful API with full CRUD for users, files, sharing, and admin; action endpoints for auth
- DTOs define request/response contracts for all routes
- Non-user services still return mock/in-memory data
- OpenAPI/Swagger spec auto-generated via `@nestjs/swagger` CLI plugin
- TypeScript `strict: true` enabled
- Prettier formatting enforced (shared root config)
- No authentication or authorization enforcement
- No input validation
- No database or persistent storage

---

## Running Locally

```bash
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
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run lint` | Run ESLint |

---

## Directory Structure

```
backend/
├── src/
│   ├── main.ts              # Bootstrap + Swagger setup
│   ├── app.module.ts         # Root module (composition root)
│   ├── app.controller.ts     # /ping endpoint
│   ├── auth/                 # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── dto/
│   ├── users/                # User management module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   ├── files/                # File metadata module
│   │   ├── files.module.ts
│   │   ├── files.controller.ts
│   │   ├── files.service.ts
│   │   └── dto/
│   ├── sharing/              # Sharing module
│   │   ├── sharing.module.ts
│   │   ├── sharing.controller.ts
│   │   ├── sharing.service.ts
│   │   └── dto/
│   └── admin/                # Admin module
│       ├── admin.module.ts
│       ├── admin.controller.ts
│       ├── admin.service.ts
│       └── dto/
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

POST   /auth/register         Register
POST   /auth/login            Login

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

## Purpose

The backend will eventually be responsible for:

- User authentication and session handling
- Role-based access control (RBAC)
- File metadata management and storage
- Administrative functionality
- Serving a RESTful API consumed by the frontend and security tools

Security controls are intentionally minimal or absent in early versions
to support controlled vulnerability exploration in later phases.
