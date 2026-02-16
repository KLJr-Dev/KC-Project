# KC-Project Architecture

This document describes the system architecture as of **v0.1.2** (identity & authentication surface).

---

## System Overview

KC-Project is a two-process full-stack web application with no persistence layer yet.

```mermaid
flowchart LR
    subgraph client [Untrusted Client]
        Frontend["Frontend\nNext.js :3000\nApp Router"]
    end
    subgraph server [Trust Boundary]
        Backend["Backend\nNestJS :4000\nREST API"]
    end
    Frontend -- "HTTP/REST\nJSON over localhost:4000" --> Backend
    Backend -- "JSON responses" --> Frontend
```

- **Frontend** — Next.js 16 with App Router, Tailwind CSS, React 19. Runs on port 3000. All pages are client components (`'use client'`) that call the backend via fetch.
- **Backend** — NestJS 11 on Express. Runs on port 4000. Modular architecture with controllers, services, and DTOs. CORS enabled (intentionally permissive). No database.
- **Communication** — Plain HTTP REST. JSON request/response bodies. No WebSockets, no GraphQL, no tRPC.
- **Persistence** — None. All data is in-memory and resets on process restart.

---

## Backend Module Structure

The backend follows NestJS's module-based architecture. `AppModule` is the composition root; each domain feature is a self-contained module.

```mermaid
graph TD
    AppModule["AppModule\n(composition root)"]
    AppController["/ping"]
    AuthModule["AuthModule"]
    UsersModule["UsersModule"]
    FilesModule["FilesModule"]
    SharingModule["SharingModule"]
    AdminModule["AdminModule"]

    AppModule --> AppController
    AppModule --> AuthModule
    AppModule --> UsersModule
    AppModule --> FilesModule
    AppModule --> SharingModule
    AppModule --> AdminModule

    AuthModule --> AuthController["AuthController\nPOST /auth/register\nPOST /auth/login"]
    AuthModule --> AuthService["AuthService\nReal register + login"]
    AuthModule -.->|imports| UsersModule

    UsersModule --> UsersController["UsersController\nCRUD /users"]
    UsersModule --> UsersService["UsersService\nIn-memory store\n(plaintext passwords)"]

    FilesModule --> FilesController["FilesController\nPOST /files\nGET-DELETE /files/:id"]
    FilesModule --> FilesService["FilesService\nIn-memory metadata"]

    SharingModule --> SharingController["SharingController\nCRUD /sharing"]
    SharingModule --> SharingService["SharingService\nIn-memory store"]

    AdminModule --> AdminController["AdminController\nCRUD /admin"]
    AdminModule --> AdminService["AdminService\nIn-memory store"]
```

### Per-module pattern

Every module follows the same internal structure:

- **Controller** — Thin HTTP layer. Maps routes to service methods. Handles 404 on missing IDs. No business logic.
- **Service** — Business logic and data access (currently in-memory arrays). Singleton per module via DI.
- **DTOs** — Request shapes (Create/Update) and response shapes. Classes (not interfaces) so NestJS can instantiate them and the Swagger plugin can introspect them.

---

## Frontend Structure

```
app/                          Next.js App Router pages
├── layout.tsx                Root layout (Header, PageContainer, Footer)
├── providers.tsx             Client wrapper for AuthProvider + ThemeProvider
├── globals.css               Design tokens (CSS variables), Tailwind, dark mode
├── page.tsx                  Landing / home page
├── auth/
│   └── page.tsx              Tabbed Register + Sign In form
├── users/                    Users CRUD pages
├── files/                    Upload + view metadata
├── admin/                    Admin CRUD pages
└── sharing/                  Sharing CRUD pages

app/components/               Layout-level components
├── header.tsx                Nav bar + auth toggle + theme toggle
├── footer.tsx                Site footer
└── page-container.tsx        Content wrapper (max-width, padding)

app/components/ui/            Reusable UI primitives
├── form-input.tsx            Label + input + validation error
├── submit-button.tsx         Button with loading state
├── error-banner.tsx          Error message block
└── success-banner.tsx        Success message block

lib/
├── api.ts                    Typed fetch wrappers for all backend routes
├── auth-context.tsx          Auth state (token, userId) + localStorage persistence
├── theme-context.tsx         Theme state (light/dark/system) + class-based toggle
├── types.gen.ts              Auto-generated from OpenAPI spec
└── types.ts                  Re-export layer with friendly aliases
```

All pages are `'use client'` components. They call `lib/api.ts` functions which return typed promises. Auth state is managed via `AuthContext` (persisted to localStorage). The layout uses a shared app shell (Header, Footer, PageContainer) with design tokens defined as CSS variables in `globals.css`.

---

## API Design

### RESTful resources

Resources follow standard REST conventions — the HTTP method carries the verb:

| Method | Path pattern | Meaning |
|--------|-------------|---------|
| POST   | /resource   | Create  |
| GET    | /resource   | List    |
| GET    | /resource/:id | Read one |
| PUT    | /resource/:id | Update |
| DELETE | /resource/:id | Delete |

Applied to: `/users`, `/files`, `/sharing`, `/admin`

### Action endpoints

Non-CRUD operations use verb paths:

- `POST /auth/register` — Register a new user
- `POST /auth/login` — Authenticate
- `GET /ping` — Infrastructure reachability check

### OpenAPI spec

The backend auto-generates an OpenAPI 3.0 spec via `@nestjs/swagger` with the CLI plugin (no manual `@ApiProperty()` decorators needed). Available at:

- **Swagger UI:** `http://localhost:4000/api/docs`
- **JSON spec:** `http://localhost:4000/api/docs-json`

---

## Type Flow

Types flow from backend to frontend through code generation:

```mermaid
flowchart TD
    DTOs["Backend DTO classes"]
    SwaggerPlugin["@nestjs/swagger CLI plugin\nintrospects at compile time"]
    OpenAPISpec["OpenAPI 3.0 JSON spec\nserved at /api/docs-json"]
    Codegen["openapi-typescript\nnpm run generate:types"]
    TypesGen["frontend/lib/types.gen.ts\nauto-generated, do not edit"]
    Types["frontend/lib/types.ts\nre-exports with friendly aliases"]
    Consumers["frontend/lib/api.ts\n+ page components"]

    DTOs --> SwaggerPlugin --> OpenAPISpec --> Codegen --> TypesGen --> Types --> Consumers
```

This replaced the manual DTO mirroring from v0.0.7. If a backend DTO changes, regenerating types surfaces the difference immediately.

---

## Request Lifecycle

A typical request flows through these layers:

```mermaid
sequenceDiagram
    participant Browser
    participant Page as Next.js Page
    participant API as lib/api.ts
    participant Controller as NestJS Controller
    participant Service as NestJS Service
    participant Store as In-Memory Store

    Browser->>Page: User action (form submit, page load)
    Page->>API: Typed function call (e.g. usersCreate)
    API->>Controller: fetch("http://localhost:4000/users", ...)
    Controller->>Service: Delegate (e.g. service.create(dto))
    Service->>Store: Read/write in-memory array
    Store-->>Service: Data
    Service-->>Controller: Response object
    Controller-->>API: JSON HTTP response
    API-->>Page: Typed promise resolves
    Page-->>Browser: Re-render with data or error
```

As of v0.1.2, there is no middleware, no guards, no validation pipe, and no database layer in this chain. Basic field validation exists in `AuthService` (throws 400/401/409). These layers will be inserted incrementally as the roadmap progresses.

---

## Module Dependencies

As of v0.1.2, `AuthModule` imports `UsersModule` to access user data during registration and login. All other modules remain independent.

```mermaid
graph TD
    AppModule["AppModule"]
    UsersModule["UsersModule"]
    AuthModule["AuthModule"]
    FilesModule["FilesModule"]
    SharingModule["SharingModule"]
    AdminModule["AdminModule"]

    AppModule --> UsersModule
    AppModule --> AuthModule
    AppModule --> FilesModule
    AppModule --> SharingModule
    AppModule --> AdminModule

    AuthModule -.->|"imports (register + login)"| UsersModule
```

**Current cross-module dependencies:**

- `AuthModule -> UsersModule` — `AuthService` uses `UsersService.findByEmail()`, `UsersService.findEntityByEmail()`, and `UsersService.create()` for registration and login. Passwords are stored and compared as plaintext (intentional).

**Future dependencies (not yet implemented):**

- **v0.3.x** — SharingModule will depend on FilesModule (to reference file records)
- **v0.4.x** — AdminModule will depend on UsersModule (to manage roles)

---

## Trust Boundaries

The frontend is an **untrusted client**. This is a stated architectural principle, partially enforced as of v0.1.2.

As of v0.1.2:
- **Authentication exists but is intentionally weak** — registration and login are functional, but tokens are stub strings (`stub-token-{id}`) with no cryptographic value and no backend verification
- **No authorization** — no guards, no middleware, no protected routes
- **Passwords are plaintext** — stored and compared without hashing
- **CORS allows all origins** — intentionally permissive
- **Basic input validation** — required field checks and duplicate email detection on registration
- **No rate limiting** — unlimited auth attempts
- **All data is in-memory** — resets on process restart

These weaknesses are intentional. The security surface grows incrementally per the roadmap. See [auth-flow.md](./auth-flow.md) for a detailed security surface table. Enforcement matures through v0.4.x (authorization).

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend framework | NestJS | 11.x |
| Backend runtime | Node.js | 20+ |
| Frontend framework | Next.js (App Router) | 16.x |
| UI library | React | 19.x |
| Styling | Tailwind CSS | 4.x |
| Language | TypeScript (strict) | 5.x |
| API docs | @nestjs/swagger | latest |
| Type codegen | openapi-typescript | 7.x |
| Linting | ESLint 9 (flat config) | per-project |
| Formatting | Prettier 3 | shared root config |

---

## What This Architecture Does Not Include (Yet)

- Database / persistence (v0.2.x)
- Real authentication tokens / sessions (v0.1.3+) — registration and login work but tokens are stubs
- File storage (v0.3.x)
- Authorization / RBAC (v0.4.x)
- Containers / deployment (v0.5.x)
- CI/CD pipelines
- Environment configuration
