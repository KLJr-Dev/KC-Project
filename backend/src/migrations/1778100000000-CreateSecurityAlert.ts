/** Cycle-10 Blue — Nest security_alert table for Defense Ops. */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSecurityAlert1778100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "security_alert" (
        "id" character varying NOT NULL,
        "severity" character varying NOT NULL,
        "kind" character varying NOT NULL,
        "message" text NOT NULL,
        "sourceAction" character varying NOT NULL DEFAULT '',
        "acked" boolean NOT NULL DEFAULT false,
        "createdAt" character varying NOT NULL,
        CONSTRAINT "PK_security_alert" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_security_alert_acked" ON "security_alert" ("acked")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "security_alert"`);
  }
}
