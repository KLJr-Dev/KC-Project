import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshToken1777400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_token" (
        "id" character varying NOT NULL,
        "userId" character varying NOT NULL,
        "tokenHash" character varying NOT NULL,
        "expiresAt" character varying NOT NULL,
        "revoked" boolean NOT NULL DEFAULT false,
        "createdAt" character varying NOT NULL,
        CONSTRAINT "PK_refresh_token" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_refresh_token_user" ON "refresh_token" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_refresh_token_hash" ON "refresh_token" ("tokenHash")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_token"`);
  }
}
