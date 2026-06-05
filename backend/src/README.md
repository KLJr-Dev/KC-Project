# Backend source (`src/`)

NestJS application source for KC-Project v1.0.0.

## Modules

| Module | Path | Responsibility |
|--------|------|----------------|
| `AppModule` | `app.module.ts` | Composition root, TypeORM config |
| `AuthModule` | `auth/` | Register, login, JWT, guards |
| `UsersModule` | `users/` | User CRUD |
| `FilesModule` | `files/` | Upload, download, approve |
| `SharingModule` | `sharing/` | Share CRUD, public token download |
| `AdminModule` | `admin/` | Admin users, stats, role changes |
| `AuditModule` | `audit/` | AuditLog persistence |

## Key files

- `main.ts` — bootstrap, CORS, Swagger, ValidationPipe
- `app.controller.ts` — `/ping`, `/health`, `/admin/crash-test`
- `data-source.ts` — TypeORM CLI (migrations)
- `migrations/` — schema + demo user/file/share seeds

## DTO READMEs

Per-domain DTO docs in `*/dto/README.md`.

## Pentest reference

[Ground truth](../../docs/security/Cycle-1/Dev/v1.0.0-ground-truth.md) — endpoint guard matrix and exploit chains.
