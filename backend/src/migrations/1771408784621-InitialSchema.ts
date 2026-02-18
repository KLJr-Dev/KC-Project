import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * v0.2.5 — Initial schema migration.
 *
 * Creates the 4 tables that previously existed via synchronize: true.
 * This migration is idempotent via IF NOT EXISTS guards.
 */
export class InitialSchema1771408784621 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id"        varchar PRIMARY KEY,
        "email"     varchar NOT NULL,
        "username"  varchar NOT NULL,
        "password"  varchar NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "file_entity" (
        "id"         varchar PRIMARY KEY,
        "ownerId"    varchar,
        "filename"   varchar NOT NULL,
        "size"       integer NOT NULL DEFAULT 0,
        "uploadedAt" varchar NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sharing_entity" (
        "id"        varchar PRIMARY KEY,
        "ownerId"   varchar,
        "fileId"    varchar NOT NULL,
        "sharedWith" varchar NOT NULL,
        "permission" varchar NOT NULL DEFAULT 'read',
        "createdAt" varchar NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_item" (
        "id"          varchar PRIMARY KEY,
        "name"        varchar NOT NULL,
        "description" varchar NOT NULL DEFAULT '',
        "createdAt"   varchar NOT NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_item"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sharing_entity"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "file_entity"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
  }
}
