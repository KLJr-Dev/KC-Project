/**
 * M5 / v2.0.0 — Re-hash existing demo user plaintext passwords to bcrypt.
 *
 * Security measures:
 * - CWE-256: Databases created before SeedDemoUsers hashed inserts still hold
 *   plaintext for @kc.test accounts. This migration upgrades those rows in place.
 * - Idempotent: skips rows whose password already looks like bcrypt ($2a$/$2b$/$2y$).
 * - Fail-closed for unknown plaintext users: we only know demo cleartexts;
 *   other legacy plaintext rows will fail login until an admin resets them
 *   (AuthService.verifyPassword rejects non-bcrypt storage).
 *
 * Runs after SeedDemoUsers (timestamp 1777500000000 > 1771430000000).
 */
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

const BCRYPT_COST = 12;

const DEMO_PLAINS: ReadonlyArray<{ email: string; plain: string }> = [
  { email: 'user@kc.test', plain: 'UserPass123!' },
  { email: 'mod@kc.test', plain: 'ModPass123!' },
  { email: 'admin@kc.test', plain: 'AdminPass123!' },
  { email: 'other@kc.test', plain: 'OtherPass123!' },
];

function looksLikeBcrypt(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

export class HashDemoUserPasswords1777500000000 implements MigrationInterface {
  name = 'HashDemoUserPasswords1777500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const { email, plain } of DEMO_PLAINS) {
      const rows: Array<{ password: string }> = await queryRunner.query(
        `SELECT password FROM "user" WHERE email = $1 LIMIT 1`,
        [email],
      );
      if (rows.length === 0) continue;
      if (looksLikeBcrypt(rows[0].password)) continue;

      const hash = await bcrypt.hash(plain, BCRYPT_COST);
      await queryRunner.query(`UPDATE "user" SET password = $1, "updatedAt" = $2 WHERE email = $3`, [
        hash,
        new Date().toISOString(),
        email,
      ]);
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Irreversible without restoring plaintext (intentionally not done).
  }
}
