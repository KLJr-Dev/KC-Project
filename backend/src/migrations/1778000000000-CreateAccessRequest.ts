/**
 * Cycle-10 Blue — pending Document Ops access requests (v2.10.0).
 * Public submit no longer mints moderator users.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccessRequest1778000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "access_request" (
        "id" character varying NOT NULL,
        "email" character varying NOT NULL,
        "username" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "justification" text NOT NULL DEFAULT '',
        "status" character varying NOT NULL DEFAULT 'pending',
        "createdAt" character varying NOT NULL,
        "reviewedAt" character varying,
        "reviewedBy" character varying,
        CONSTRAINT "PK_access_request" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_access_request_email_pending"
       ON "access_request" ("email") WHERE "status" = 'pending'`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_access_request_status" ON "access_request" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "access_request"`);
  }
}
