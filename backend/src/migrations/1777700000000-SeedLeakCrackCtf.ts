import { MigrationInterface, QueryRunner } from 'typeorm';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  buildOpsReminderBody,
  CTF_FLAG_LOCAL,
  CTF_FLAG_PROOF,
  CTF_OPS_FILE_ID,
  CTF_OPS_OWNER_ID,
  CTF_OPS_SHARE_ID,
  CTF_OPS_SHARE_TOKEN,
  CTF_RO_PASSWORD,
  CTF_RO_USER,
} from '../ctf/ctf.constants';

/**
 * Cycle-3 leak-crack-db — ctf_flags + ops-reminder public share + ctf_ro role/RLS.
 * Breaks activate only when CTF_MODE=true (SQLi) + compose publishes :5433.
 */
export class SeedLeakCrackCtf1777700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const now = new Date().toISOString();
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const body = buildOpsReminderBody();
    const diskPath = join(uploadsDir, 'seed-ops-reminder.txt');
    writeFileSync(diskPath, body, 'utf8');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ctf_flags" (
        "id" varchar PRIMARY KEY,
        "tier" varchar(16) NOT NULL,
        "flag" varchar(32) NOT NULL,
        "label" varchar(64)
      )
    `);

    await queryRunner.query(
      `INSERT INTO "ctf_flags" ("id", "tier", "flag", "label") VALUES ($1, $2, $3, $4)
       ON CONFLICT ("id") DO UPDATE SET "tier" = EXCLUDED."tier", "flag" = EXCLUDED."flag", "label" = EXCLUDED."label"`,
      ['local', 'local', CTF_FLAG_LOCAL, 'local.txt'],
    );
    await queryRunner.query(
      `INSERT INTO "ctf_flags" ("id", "tier", "flag", "label") VALUES ($1, $2, $3, $4)
       ON CONFLICT ("id") DO UPDATE SET "tier" = EXCLUDED."tier", "flag" = EXCLUDED."flag", "label" = EXCLUDED."label"`,
      ['proof', 'proof', CTF_FLAG_PROOF, 'proof.txt'],
    );

    const fileExists: unknown[] = await queryRunner.query(
      `SELECT 1 FROM "file_entity" WHERE id = $1 LIMIT 1`,
      [CTF_OPS_FILE_ID],
    );
    if (fileExists.length === 0) {
      await queryRunner.query(
        `INSERT INTO "file_entity"
          (id, "ownerId", filename, mimetype, "storagePath", size, description, "approvalStatus", "uploadedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text::file_approval_enum, $9)`,
        [
          CTF_OPS_FILE_ID,
          CTF_OPS_OWNER_ID,
          'ops-reminder.txt',
          'text/plain',
          diskPath,
          Buffer.byteLength(body, 'utf8'),
          'Legacy ops reminder',
          'approved',
          now,
        ],
      );
    } else {
      await queryRunner.query(
        `UPDATE "file_entity"
         SET "ownerId" = $1, filename = $2, mimetype = $3, "storagePath" = $4, size = $5, description = $6, "approvalStatus" = $7::text::file_approval_enum
         WHERE id = $8`,
        [
          CTF_OPS_OWNER_ID,
          'ops-reminder.txt',
          'text/plain',
          diskPath,
          Buffer.byteLength(body, 'utf8'),
          'Legacy ops reminder',
          'approved',
          CTF_OPS_FILE_ID,
        ],
      );
    }

    const shareExists: unknown[] = await queryRunner.query(
      `SELECT 1 FROM "sharing_entity" WHERE id = $1 LIMIT 1`,
      [CTF_OPS_SHARE_ID],
    );
    if (shareExists.length === 0) {
      await queryRunner.query(
        `INSERT INTO "sharing_entity"
          (id, "ownerId", "fileId", "publicToken", "public", "createdAt", "expiresAt")
         VALUES ($1, $2, $3, $4, true, $5, '')`,
        [CTF_OPS_SHARE_ID, CTF_OPS_OWNER_ID, CTF_OPS_FILE_ID, CTF_OPS_SHARE_TOKEN, now],
      );
    } else {
      await queryRunner.query(
        `UPDATE "sharing_entity"
         SET "ownerId" = $1, "fileId" = $2, "publicToken" = $3, "public" = true, "expiresAt" = ''
         WHERE id = $4`,
        [CTF_OPS_OWNER_ID, CTF_OPS_FILE_ID, CTF_OPS_SHARE_TOKEN, CTF_OPS_SHARE_ID],
      );
    }

    // Lab role for proof (password = John plaintext). Not the app runtime role.
    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${CTF_RO_USER}') THEN
    CREATE ROLE ${CTF_RO_USER} LOGIN PASSWORD '${CTF_RO_PASSWORD}' NOSUPERUSER NOCREATEDB NOCREATEROLE;
  ELSE
    ALTER ROLE ${CTF_RO_USER} WITH LOGIN PASSWORD '${CTF_RO_PASSWORD}' NOSUPERUSER NOCREATEDB NOCREATEROLE;
  END IF;
END
$$`);

    const dbName = (await queryRunner.query(`SELECT current_database() AS d`)) as {
      d: string;
    }[];
    const database = dbName[0]?.d ?? 'kc_prod';
    await queryRunner.query(`GRANT CONNECT ON DATABASE "${database}" TO ${CTF_RO_USER}`);
    await queryRunner.query(`GRANT USAGE ON SCHEMA public TO ${CTF_RO_USER}`);
    await queryRunner.query(`GRANT SELECT ON TABLE "ctf_flags" TO ${CTF_RO_USER}`);

    // Row-level: kc_app → local only; ctf_ro → proof only.
    // current_user checks so policies work even if kc_app is created after this migration.
    await queryRunner.query(`ALTER TABLE "ctf_flags" ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`DROP POLICY IF EXISTS ctf_flags_select_by_role ON "ctf_flags"`);
    await queryRunner.query(`
      CREATE POLICY ctf_flags_select_by_role ON "ctf_flags"
        FOR SELECT
        USING (
          (current_user = 'kc_app' AND tier = 'local')
          OR (current_user = '${CTF_RO_USER}' AND tier = 'proof')
        )
    `);

    // migrate-and-grant GRANTs DML on all tables; strip writes on flags (SELECT kept for SQLi).
    await queryRunner.query(`
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'kc_app') THEN
    REVOKE INSERT, UPDATE, DELETE ON TABLE "ctf_flags" FROM kc_app;
  END IF;
END
$$`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP POLICY IF EXISTS ctf_flags_select_by_role ON "ctf_flags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ctf_flags"`);
    await queryRunner.query(`DELETE FROM "sharing_entity" WHERE id = $1`, [CTF_OPS_SHARE_ID]);
    await queryRunner.query(`DELETE FROM "file_entity" WHERE id = $1`, [CTF_OPS_FILE_ID]);
    await queryRunner.query(`DROP ROLE IF EXISTS ${CTF_RO_USER}`);
  }
}
