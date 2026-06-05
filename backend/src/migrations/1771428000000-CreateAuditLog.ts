import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLog1771428000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_log" (
        "id" character varying NOT NULL,
        "actorId" character varying NOT NULL,
        "action" character varying NOT NULL,
        "targetId" character varying NOT NULL DEFAULT '',
        "details" text NOT NULL DEFAULT '',
        "createdAt" character varying NOT NULL,
        CONSTRAINT "PK_audit_log" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_log"`);
  }
}
