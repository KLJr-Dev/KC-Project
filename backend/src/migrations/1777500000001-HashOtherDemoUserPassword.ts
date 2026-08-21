/**
 * M5 follow-up — Hash `other@kc.test` if still plaintext.
 *
 * SeedDemoFilesAndShares historically inserted plaintext for 9004. The main
 * HashDemoUserPasswords migration may already have run on existing DBs before
 * `other@kc.test` was added to its DEMO_PLAINS list — this migration closes
 * that gap idempotently (CWE-256).
 */
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class HashOtherDemoUserPassword1777500000001 implements MigrationInterface {
  name = 'HashOtherDemoUserPassword1777500000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const email = 'other@kc.test';
    const plain = 'OtherPass123!';
    const rows: Array<{ password: string }> = await queryRunner.query(
      `SELECT password FROM "user" WHERE email = $1 LIMIT 1`,
      [email],
    );
    if (rows.length === 0) return;
    if (/^\$2[aby]\$\d{2}\$/.test(rows[0].password)) return;

    const hash = await bcrypt.hash(plain, 12);
    await queryRunner.query(`UPDATE "user" SET password = $1, "updatedAt" = $2 WHERE email = $3`, [
      hash,
      new Date().toISOString(),
      email,
    ]);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Irreversible without restoring plaintext.
  }
}
