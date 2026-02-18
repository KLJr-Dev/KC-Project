# Backend Source (`src/`)

This directory contains the NestJS backend application source code for **KC-Project**.

The backend is implemented as a modular REST API and acts as the primary trust boundary of the system. All authentication, authorization, business logic, and data access will eventually live here.

At early versions (v0.0.x–v1.0.0), the backend is **intentionally insecure by design** to support security learning, penetration testing, and remediation workflows.

---

## Architectural model

The backend follows NestJS’s module-based architecture, which mirrors modern enterprise backend systems:

- **Explicit module boundaries**
- **Dependency injection (DI)**
- **Separation of concerns**
- **Realistic security failure modes**

Each domain feature is implemented as its own module under `src/`.

---

## High-level structure

```
src/
├── main.ts                # Application entry point (bootstrap)
├── app.module.ts          # Root module (composition root)
├── app.controller.ts      # Temporary root controller (/ping)
├── README.md              # This document
│
├── auth/                  # Authentication & session handling (v0.0.6 complete)
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── dto/
│       ├── register.dto.ts
│       ├── login.dto.ts
│       ├── auth-response.dto.ts
│       └── README.md
├── users/                 # User management (v0.0.6 complete)
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
│       ├── create-user.dto.ts
│       ├── update-user.dto.ts
│       ├── user-response.dto.ts
│       └── README.md
├── files/                 # File upload/download/metadata (v0.0.6 complete)
│   ├── files.module.ts
│   ├── files.controller.ts
│   ├── files.service.ts
│   └── dto/
│       ├── upload-file.dto.ts
│       ├── file-response.dto.ts
│       └── README.md
├── sharing/               # Public & private file sharing (v0.0.6 complete)
│   ├── sharing.module.ts
│   ├── sharing.controller.ts
│   ├── sharing.service.ts
│   └── dto/
│       ├── create-sharing.dto.ts
│       ├── update-sharing.dto.ts
│       ├── sharing-response.dto.ts
│       └── README.md
└── admin/                 # Administrative functionality (v0.0.6 complete)
    ├── admin.module.ts
    ├── admin.controller.ts
    ├── admin.service.ts
    └── dto/
        ├── create-admin.dto.ts
        ├── update-admin.dto.ts
        ├── admin-response.dto.ts
        └── README.md
```

---

## Core files

### `main.ts`

Application bootstrap file.

**Responsibilities:**

- Create the NestJS application
- Apply global configuration (e.g. permissive CORS)
- Start the HTTP server

This file must not contain business logic.

### `app.module.ts`

The root module of the backend.

**Responsibilities:**

- Import all feature modules
- Define the application dependency graph

Think of this as the backend’s composition root, not a router.

### `app.controller.ts`

A temporary root controller.

**Current purpose:**

- Expose a trivial `/ping` endpoint
- Verify backend reachability
- Support early frontend ↔ backend testing

This controller is not part of the final domain model.

---

## RESTful routing

The backend follows **RESTful** conventions for all resource endpoints.

REST (Representational State Transfer) treats every domain concept as a **resource** identified by a URL. Instead of encoding the action in the path (`/users/create`, `/users/delete/3`), the **HTTP method** carries the verb and the path identifies only the resource:

| HTTP method | Meaning | Example |
|---|---|---|
| `POST` | Create a new resource | `POST /users` |
| `GET` | Read one or many | `GET /users` or `GET /users/1` |
| `PUT` | Update an existing resource | `PUT /users/1` |
| `DELETE` | Remove a resource | `DELETE /users/1` |

**Why this matters:**

- **Uniform interface** — every resource follows the same pattern, so consumers (frontend, scripts, tools) can predict URLs without reading docs.
- **HTTP semantics are reused** — status codes, caching, idempotency all map cleanly when the method carries intent.
- **No verb duplication** — the path `/users` is enough; adding `/users/create` or `/users/delete/:id` duplicates information that the HTTP method already provides.

**Non-resource routes** like `/auth/register`, `/auth/login`, and `/ping` are intentionally action-based. They represent operations, not CRUD on a resource, so they keep a verb in the path. This is standard practice — REST applies to resources, not to every endpoint.

### Full route map (v0.0.6)

```
POST   /users              Create user
GET    /users              List users
GET    /users/:id          Get user by id
PUT    /users/:id          Update user
DELETE /users/:id          Delete user

POST   /files              Upload file (metadata stub)
GET    /files              List all files (v0.2.3)
GET    /files/:id          Get file metadata
DELETE /files/:id          Delete file

POST   /sharing            Create share
GET    /sharing            List shares
GET    /sharing/:id        Get share by id
PUT    /sharing/:id        Update share
DELETE /sharing/:id        Delete share

POST   /admin              Create admin item
GET    /admin              List admin items
GET    /admin/:id          Get admin item by id
PUT    /admin/:id          Update admin item
DELETE /admin/:id          Delete admin item

POST   /auth/register      Register (action, not resource)
POST   /auth/login         Login (action, not resource)

GET    /ping               Reachability check (infrastructure)
```

---

## Feature modules

Each feature lives in its own folder and follows the same internal structure.

### Module layout (example: `users/` — v0.0.6 complete)

```
users/
├── users.module.ts        # Module definition
├── users.controller.ts    # RESTful HTTP routes (POST, GET, PUT, DELETE on /users)
├── users.service.ts       # Business logic (TypeORM repository)
└── dto/                   # Request/response contracts
    ├── create-user.dto.ts
    ├── update-user.dto.ts
    ├── user-response.dto.ts
    └── README.md
```

Auth and files use the same pattern with fewer routes; admin, users, and sharing match (full CRUD).

### `*.module.ts`

**Defines:**

- Which controllers belong to the module
- Which services are provided
- Which providers are exported

Modules define explicit architectural boundaries.

### `*.controller.ts`

**Defines:**

- RESTful endpoints (resource path + HTTP method)
- Request handling
- Response formatting

**Conventions:**

- Controllers should be thin
- Delegate logic to services
- Intentionally perform weak or missing validation in early versions

### `*.service.ts`

**Defines:**

- Business logic
- Access control decisions
- Data handling (later)

Services are where intentional security mistakes will live.

### DTOs (`dto/` directories)

**DTO** = Data Transfer Object. DTOs define the shape of data crossing the API boundary.

Each feature module has its own `dto/` directory. For CRUD modules (admin, users, sharing) we use create/update/response; for auth, register/login/response; for files, upload/response.

```
dto/
├── create-*.dto.ts        # (or register.dto.ts, upload-file.dto.ts)
├── update-*.dto.ts        # where applicable
└── *-response.dto.ts     # response shape(s)
```

**At v0.0.6 (current):**

- DTOs are defined for admin, auth, users, files, sharing
- Validation is weak or absent (contract only)
- DTOs lock API shape; behaviour is mock

**DTOs are critical for:**

- API contract stability
- Frontend ↔ backend alignment
- Realistic enterprise structure

---

## Current version context (v0.2.3)

**v0.2.3 — Enumeration Surface** is complete.

- **All modules:** Services backed by TypeORM repositories, data persisted in PostgreSQL. All methods async. All resource controllers protected by JwtAuthGuard (authentication required).
- **users module:** `User` entity. `UsersService` uses `Repository<User>`. Password stored in plaintext (CWE-256). Any authenticated user can read/modify/delete any user's profile (CWE-639, CWE-862). `GET /users` returns full table dump (CWE-200, CWE-400).
- **auth module:** Registration, login, profile, logout. Real HS256 JWTs (hardcoded secret, no expiry). AuthModule exports JwtModule so resource modules can use JwtAuthGuard.
- **files module:** `FileEntity` with `ownerId` column. ownerId populated from JWT on upload but never checked on read/delete (CWE-639). `GET /files` list-all endpoint added in v0.2.3 — unbounded full table dump (CWE-200, CWE-400).
- **sharing module:** `SharingEntity` with `ownerId` column. Same IDOR vulnerability as files. Unbounded list endpoint.
- **admin module:** Any authenticated user can access admin endpoints. No role check (CWE-862). Unbounded list endpoint.
- **Enumeration surface (v0.2.3):** All 4 list endpoints unbounded. Sequential IDs allow 200/404 existence probing (CWE-203). Swagger spec publicly accessible (CWE-200). X-Powered-By header reveals Express (CWE-200).
- **Verbose DB errors (v0.2.1):** Raw TypeORM `QueryFailedError` logged to stdout. CWE-209.
- **OpenAPI/Swagger** at `/api/docs` (v0.2.3) — publicly accessible without authentication.
- **OWASP Top 10:2025:** All references migrated from 2021 to 2025 (ADR-021).
- **TypeScript** `strict: true`. **Prettier** shared config.
- PostgreSQL persistence via TypeORM (`synchronize: true`, hardcoded credentials)
- Authentication via JWTs — enforced on all endpoints
- **No authorization enforcement** — authentication without authorization (CWE-862)
- 29 e2e tests, 28 CWE entries
