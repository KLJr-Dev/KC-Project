import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Internal domain entity representing a user. Now a TypeORM entity mapped
 * to the "user" table in PostgreSQL. Services work with User entities,
 * DTOs are the API boundary.
 *
 * Fields:
 *  - id:        Sequential string ID, manually assigned (intentionally
 *               predictable — security surface for v0.2.3 enumeration).
 *               CWE-330 (Use of Insufficiently Random Values) | A04:2025
 *  - email:     User email address (no uniqueness constraint — intentional)
 *  - username:  Display name
 *  - password:  Stored in plaintext in the database column (intentionally
 *               insecure — hashing deferred to v2.0.0).
 *               CWE-256 (Plaintext Storage of a Password) | A07:2025
 *  - createdAt: ISO 8601 timestamp string
 *  - updatedAt: ISO 8601 timestamp string
 *
 * VULN: No unique constraint on email. Duplicate emails can be inserted
 *       if the application-level check is bypassed. No DB-level protection.
 *       CWE-1188 (Insecure Default Initialization of Resource) | A02:2025
 *       Remediation (v2.0.0): UNIQUE constraint on email column.
 *
 * VULN: Password column has no special handling — stored as a regular
 *       varchar, visible in DB dumps, logs, and backups.
 *       CWE-256 | A07:2025
 *       Remediation (v2.0.0): bcrypt hash with cost factor 12.
 */
@Entity()
export class User {
  @PrimaryColumn()
  id!: string;

  @Column()
  email!: string;

  @Column()
  username!: string;

  @Column()
  password!: string;

  @Column()
  createdAt!: string;

  @Column()
  updatedAt!: string;
}
