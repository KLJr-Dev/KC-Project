import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * v0.2.5 -- Initial schema migration.
 *
 * Creates the 4 tables that previously existed via synchronize: true.
 * Column names and types match the actual TypeORM entity definitions.
 * This migration is idempotent via IF NOT EXISTS guards.
 */
export class InitialSchema1771408784621 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id"        character varying PRIMARY KEY,
        "email"     character varying NOT NULL,
        "username"  character varying NOT NULL,
        "password"  character varying NOT NULL,
        "createdAt" character varying NOT NULL,
        "updatedAt" character varying NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "file_entity" (
        "id"          character varying PRIMARY KEY,
        "ownerId"     character varying,
        "filename"    character varying NOT NULL,
        "size"        integer NOT NULL DEFAULT 0,
        "uploadedAt"  character varying NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sharing_entity" (
        "id"        character varying PRIMARY KEY,
        "ownerId"   character varying,
        "fileId"    character varying,
        "public"    boolean NOT NULL DEFAULT false,
        "createdAt" character varying NOT NULL,
        "expiresAt" character varying
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_item" (
        "id"        character varying PRIMARY KEY,
        "label"     character varying,
        "role"      character varying,
        "createdAt" character varying NOT NULL
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
