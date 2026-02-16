/**
 * v0.1.0 — User Model Introduced
 *
 * Internal domain entity representing a user. This is the backend's
 * authoritative model — services work with User entities, and DTOs
 * are only the API boundary.
 *
 * Fields:
 *  - id:        Sequential string ID (intentionally predictable — security
 *               surface for v0.2.3 enumeration attacks)
 *  - email:     User email address
 *  - username:  Display name
 *  - password:  Stored in plaintext (intentionally insecure — hashing
 *               introduced at v0.1.2 as "plaintext or weakly handled")
 *  - createdAt: ISO 8601 timestamp
 *
 * No persistence yet — the entity is an in-memory shape, not a DB-mapped
 * model. ORM decorators will be added in v0.2.x when a database is
 * introduced.
 */
export class User {
  id!: string;
  email!: string;
  username!: string;
  password!: string;
  createdAt!: string;
  updatedAt!: string;
}
