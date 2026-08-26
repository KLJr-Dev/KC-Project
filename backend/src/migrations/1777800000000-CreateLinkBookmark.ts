import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLinkBookmark1777800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "link_bookmark" (
        "id" character varying NOT NULL,
        "userId" character varying NOT NULL,
        "url" character varying(2048) NOT NULL,
        "title" character varying(512),
        "createdAt" character varying NOT NULL,
        CONSTRAINT "PK_link_bookmark" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_link_bookmark_user" ON "link_bookmark" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "link_bookmark"`);
  }
}
