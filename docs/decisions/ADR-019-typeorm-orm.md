# ADR-019: TypeORM as ORM

**Status:** Accepted

**Date:** v0.2.0 (Database Introduction)

---

## Context

v0.2.0 introduces PostgreSQL. The backend needs a data access layer to replace the in-memory arrays used since v0.0.6. Options considered:

- **TypeORM** — Decorator-based entities, official `@nestjs/typeorm` integration, Active Record or Data Mapper patterns. Most common ORM in the NestJS ecosystem.
- **Prisma** — Schema-first with a generated client. Excellent DX and type safety but requires a separate `.prisma` schema file and a different mental model from NestJS decorators.
- **MikroORM** — Clean Data Mapper implementation with good NestJS support. Smaller community than TypeORM.
- **Drizzle** — Lightweight, SQL-like query builder with strong types. Newer, less NestJS ecosystem support.
- **Raw `pg` driver** — No abstraction, manual SQL. Maximum control but no migrations, no entity mapping.

## Decision

Use **TypeORM** with the `@nestjs/typeorm` integration package.

Rationale:

1. **Minimal migration effort** — The `User` entity class already exists as a plain TypeScript class. Adding `@Entity()` and `@Column()` decorators converts it to a TypeORM entity with minimal diff. The same applies to the three new entities (file, sharing, admin).

2. **Official NestJS integration** — `TypeOrmModule.forRoot()` and `TypeOrmModule.forFeature()` are well-documented, first-class NestJS patterns. Repository injection via `@InjectRepository()` follows the same dependency injection model used throughout the codebase.

3. **Service interface preserved** — Service method signatures (`create`, `findById`, `findAll`, `update`, `delete`) stay the same. Only the implementation changes from array operations to repository operations.

4. **Unsafe defaults as a feature** — `synchronize: true` is a well-known TypeORM footgun that auto-alters the database schema on every startup. For KC-Project's insecure-by-design philosophy, this is a documentable vulnerability (CWE-1188). TypeORM makes it trivially easy to introduce this.

5. **Migration support for later** — v0.2.5 calls for migrations. TypeORM has built-in migration tooling (`typeorm migration:generate`, `migration:run`). This avoids introducing a second tool later.

Prisma was the strongest alternative. It was rejected because:
- It requires a separate `schema.prisma` file rather than decorating existing entity classes.
- The generated Prisma Client is a different abstraction from NestJS providers/repositories.
- Migration from in-memory arrays to Prisma would require restructuring the service layer more significantly.

## Consequences

- **Positive:** Minimal code change — existing entity classes gain decorators, services swap arrays for repositories.
- **Positive:** `synchronize: true` is itself a documentable CWE for the project's security surface.
- **Positive:** Migration tooling available for v0.2.5 without additional dependencies.
- **Negative:** TypeORM has known maintenance and API inconsistency issues. Acceptable for this project's scope.
- **Negative:** TypeORM's query builder is less type-safe than Prisma's generated client. Acceptable — we use simple `findOne`/`save`/`delete` operations.
