# Data Model

Entity definitions and relationships for KC-Project. Describes the v0.2.2 PostgreSQL schema (current), the v1.0.0 target schema, and the v2.0.0 hardened schema.

---

## Current State (v0.2.2) -- PostgreSQL

PostgreSQL 16 via Docker Compose. TypeORM with `synchronize: true` auto-creates tables from entity decorators. See [ADR-019](../decisions/ADR-019-typeorm-orm.md) and [ADR-020](../decisions/ADR-020-docker-db-only.md).

### Tables

| Table | Entity Class | Notes |
|-------|-------------|-------|
| `user` | `User` | Auth + identity. Plaintext password column (CWE-256). |
| `file_entity` | `FileEntity` | Metadata only — no real file I/O yet. `ownerId` column added in v0.2.2 (stored, never enforced). |
| `sharing_entity` | `SharingEntity` | No FK to files. `ownerId` column added in v0.2.2 (stored, never enforced). |
| `admin_item` | `AdminItem` | Placeholder admin records. |

All tables use `@PrimaryColumn()` with manually assigned sequential string IDs (`"1"`, `"2"`, ...) — intentionally predictable (CWE-330). No unique constraints, no foreign keys, no indices beyond primary keys. Schema weaknesses are intentional per [ADR-006](../decisions/ADR-006-insecure-by-design.md).

### User Entity (v0.2.0)

```typescript
@Entity()
class User {
  @PrimaryColumn()
  id: string;          // Sequential string ("1", "2", "3"...)
  @Column()
  email: string;       // No unique constraint
  @Column()
  username: string;
  @Column()
  password: string;    // Plaintext in DB (CWE-256)
  @Column()
  createdAt: string;   // ISO 8601
  @Column()
  updatedAt: string;   // ISO 8601
}
```

### FileEntity (v0.2.2)

```typescript
@Entity()
class FileEntity {
  @PrimaryColumn()
  id: string;            // Sequential string
  @Column({ nullable: true })
  ownerId: string;       // User ID from JWT — stored but never checked (CWE-639)
  @Column()
  filename: string;
  @Column({ type: 'int', default: 0 })
  size: number;
  @Column()
  uploadedAt: string;    // ISO 8601
}
```

### SharingEntity (v0.2.2)

```typescript
@Entity()
class SharingEntity {
  @PrimaryColumn()
  id: string;            // Sequential string
  @Column({ nullable: true })
  ownerId: string;       // User ID from JWT — stored but never checked (CWE-639)
  @Column({ nullable: true })
  fileId: string;        // No FK constraint (CWE-1188)
  @Column({ default: false })
  public: boolean;
  @Column()
  createdAt: string;
  @Column({ nullable: true })
  expiresAt: string;
}
```

### Previous State (v0.0.x–v0.1.x)

No database. Entities were plain TypeScript classes stored in service-level arrays. Data reset on restart. See [ADR-008](../decisions/ADR-008-in-memory-before-persistence.md).

---

## v1.0.0 -- Database Schema (PostgreSQL)

The target schema at the insecure MVP. Builds on v0.2.0 with additional columns, relationships, and file storage.

### Entity Relationship Diagram

```mermaid
erDiagram
  users {
    integer id PK "Sequential (intentionally predictable)"
    varchar email "Not unique-constrained at app level"
    varchar username
    varchar password_hash "Weak hash or plaintext"
    varchar role "Default: 'user'"
    timestamp created_at
    timestamp updated_at
  }

  files {
    integer id PK "Sequential"
    integer owner_id FK "References users.id"
    varchar filename "Partially trusted from client"
    varchar mimetype "Client-supplied, not validated"
    bigint size "Bytes"
    varchar storage_path "Local filesystem path"
    timestamp created_at
  }

  shares {
    integer id PK "Sequential"
    integer file_id FK "References files.id"
    integer creator_id FK "References users.id"
    varchar public_token "Predictable or sequential"
    timestamp created_at
    timestamp expires_at "Nullable (no expiry enforced)"
  }

  users ||--o{ files : "owns"
  users ||--o{ shares : "creates"
  files ||--o{ shares : "shared via"
```

### Entity Details

#### users

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | integer | PRIMARY KEY, auto-increment | Sequential -- CWE-330 (predictable) |
| email | varchar(255) | NOT NULL | No unique constraint at app level in v1.0.0 |
| username | varchar(100) | NOT NULL | |
| password_hash | varchar(255) | NOT NULL | Weak hash or plaintext in v1.0.0 -- CWE-256 |
| role | varchar(20) | NOT NULL, DEFAULT 'user' | 'user' or 'admin'. Stored as string, not enum |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | |

#### files

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | integer | PRIMARY KEY, auto-increment | Sequential -- CWE-330 |
| owner_id | integer | NOT NULL, FK -> users.id | No ownership check at app level in v1.0.0 -- CWE-639 |
| filename | varchar(255) | NOT NULL | Client-supplied, not sanitised -- CWE-22 |
| mimetype | varchar(100) | | Client-supplied Content-Type, not validated -- CWE-434 |
| size | bigint | | No upload size limit enforced -- CWE-400 |
| storage_path | varchar(500) | NOT NULL | Local filesystem path. No path validation -- CWE-22 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | |

#### shares

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | integer | PRIMARY KEY, auto-increment | Sequential -- CWE-330 |
| file_id | integer | NOT NULL, FK -> files.id | |
| creator_id | integer | NOT NULL, FK -> users.id | |
| public_token | varchar(100) | NOT NULL | Predictable or sequential -- CWE-330 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | |
| expires_at | timestamp | NULL | No expiry enforced when NULL -- CWE-613 |

---

## Intentional Weaknesses at the Data Layer

| Weakness | CWE | OWASP | Affected Entity | Detail |
|----------|-----|-------|-----------------|--------|
| Sequential integer IDs | CWE-330 | A01:2021 | All | IDs are predictable: 1, 2, 3... Enables enumeration. |
| No unique constraint on email | CWE-289 | A07:2021 | users | Duplicate check is in application code only. Race condition possible. |
| Weak/plaintext password storage | CWE-256 | A07:2021 | users | `password_hash` may contain plaintext or weak hash. |
| No ownership enforcement at DB level | CWE-639 | A01:2021 | files, shares | FK exists but application doesn't always filter by owner. |
| Client-supplied filename stored directly | CWE-22 | A01:2021 | files | No path sanitisation on `filename` or `storage_path`. |
| Client-supplied MIME type trusted | CWE-434 | A04:2021 | files | `mimetype` comes from request, not validated against file content. |
| No upload size limit | CWE-400 | A04:2021 | files | `size` recorded but not enforced. |
| Predictable sharing tokens | CWE-330 | A01:2021 | shares | `public_token` is sequential or easily guessable. |
| No share expiry enforcement | CWE-613 | A07:2021 | shares | `expires_at` can be NULL, and the app doesn't check it. |
| SQL error messages exposed | CWE-209 | A05:2021 | All | Raw database errors returned to client. |
| ownerId stored but never enforced | CWE-639 | A01:2021 | file_entity, sharing_entity | ownerId column populated on creation but no WHERE clause checks it on read/update/delete. Any authenticated user can access any resource (IDOR). |
| No FK on ownerId | CWE-1188 | A05:2021 | file_entity, sharing_entity | ownerId references user by convention, no DB constraint. Can reference deleted users. |
| Authentication without authorization | CWE-862 | A01:2021 | All | JwtAuthGuard on all controllers but no ownership or role checks. |

---

## v2.0.0 -- Hardened Schema

Same functional shape, every weakness addressed.

```mermaid
erDiagram
  users_v2 {
    uuid id PK "UUIDv4 (unpredictable)"
    varchar email UK "UNIQUE constraint"
    varchar username
    varchar password_hash "bcrypt cost 12"
    varchar role "ENUM type"
    timestamp created_at
    timestamp updated_at
  }

  files_v2 {
    uuid id PK "UUIDv4"
    uuid owner_id FK "References users.id"
    varchar filename "Sanitised server-side"
    varchar mimetype "Validated via magic bytes"
    bigint size "Enforced upload limit"
    varchar storage_path "Canonicalised, chrooted"
    timestamp created_at
  }

  shares_v2 {
    uuid id PK "UUIDv4"
    uuid file_id FK "References files.id"
    uuid creator_id FK "References users.id"
    varchar public_token UK "Cryptographically random"
    timestamp created_at
    timestamp expires_at "NOT NULL, enforced"
  }

  refresh_tokens {
    uuid id PK
    uuid user_id FK "References users.id"
    varchar token UK "Cryptographically random"
    timestamp expires_at "NOT NULL"
    timestamp created_at
  }

  users_v2 ||--o{ files_v2 : "owns"
  users_v2 ||--o{ shares_v2 : "creates"
  users_v2 ||--o{ refresh_tokens : "has"
  files_v2 ||--o{ shares_v2 : "shared via"
```

### Key changes

| v1.0.0 | v2.0.0 | CWE Remediated |
|--------|--------|----------------|
| Sequential integer IDs | UUIDv4 on all tables | CWE-330 |
| No email unique constraint | `UNIQUE` constraint on `users.email` | CWE-289 |
| Plaintext/weak passwords | bcrypt cost 12 | CWE-256 |
| No ownership filtering | `WHERE owner_id = $1` on every query | CWE-639 |
| Client-supplied filenames | Server-side sanitisation (strip path chars, null bytes) | CWE-22 |
| Client MIME type trusted | Magic byte validation | CWE-434 |
| No size limit | Multer enforced (10 MB) | CWE-400 |
| Predictable share tokens | `crypto.randomBytes(32).toString('hex')` | CWE-330 |
| Nullable expires_at | `NOT NULL`, enforced by app | CWE-613 |
| Raw SQL errors to client | Global exception filter | CWE-209 |
| No refresh token table | `refresh_tokens` table with rotation and revocation | CWE-613 |
