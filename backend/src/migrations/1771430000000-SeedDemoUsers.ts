import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * v0.9.0 — Idempotent demo users for pentest / UX testing.
 * Plaintext passwords intentional (CWE-256). See docs/deploy/demo-users.md.
 */
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

      await queryRunner.query(
        `INSERT INTO "user" (id, email, username, password, role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5::user_role_enum, $6, $6)`,
        [u.id, u.email, u.username, u.password, u.role, now],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "user" WHERE email IN ('user@kc.test', 'mod@kc.test', 'admin@kc.test')`,
    );
  }
}
