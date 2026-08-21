/**
 * M5 / v2.0.0 — Seed demo users with bcrypt hashes (not plaintext).
 *
 * Security measures:
 * - CWE-256: Demo account passwords are hashed at cost 12 before INSERT.
 * - Idempotent: skips email if already present (existing DBs are upgraded by
 *   HashDemoUserPasswords migration).
 *
 * Plaintext values remain documented in docs/deploy/demo-users.md for lab login
 * only — they must never appear in the password column after this seed/migration.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

const BCRYPT_COST = 12;

export class SeedDemoUsers1771430000000 implements MigrationInterface {
  private readonly demoUsers = [
    {
      id: '9001',
      email: 'user@kc.test',
      username: 'demo_user',
      password: 'UserPass123!',
      role: 'user',
    },
    {
      id: '9002',
      email: 'mod@kc.test',
      username: 'demo_mod',
      password: 'ModPass123!',
      role: 'moderator',
    },
    {
      id: '9003',
      email: 'admin@kc.test',
      username: 'demo_admin',
      password: 'AdminPass123!',
      role: 'admin',
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const now = new Date().toISOString();
    for (const u of this.demoUsers) {
      const existing: unknown[] = await queryRunner.query(
        `SELECT 1 FROM "user" WHERE email = $1 LIMIT 1`,
        [u.email],
      );
      if (existing.length > 0) continue;

      const passwordHash = await bcrypt.hash(u.password, BCRYPT_COST);
      await queryRunner.query(
        `INSERT INTO "user" (id, email, username, password, role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5::user_role_enum, $6, $6)`,
        [u.id, u.email, u.username, passwordHash, u.role, now],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "user" WHERE email IN ('user@kc.test', 'mod@kc.test', 'admin@kc.test')`,
    );
  }
}
