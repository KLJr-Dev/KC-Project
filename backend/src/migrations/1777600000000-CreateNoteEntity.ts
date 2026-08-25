import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cycle-4 SoftDev — create note_entity for Notes API (`v1.2.0`).
 * Attachment columns present for P1c upload wiring; nullable until used.
 */
export class CreateNoteEntity1777600000000 implements MigrationInterface {
  name = 'CreateNoteEntity1777600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "note_entity" (
        "id" character varying NOT NULL,
        "ownerId" character varying NOT NULL,
        "title" character varying NOT NULL,
        "body" text NOT NULL,
        "flagged" boolean NOT NULL DEFAULT false,
        "attachmentFilename" character varying,
        "attachmentMimetype" character varying,
        "attachmentStoragePath" character varying,
        "createdAt" character varying NOT NULL,
        "updatedAt" character varying NOT NULL,
        CONSTRAINT "PK_note_entity" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_note_entity_ownerId" ON "note_entity" ("ownerId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_note_entity_ownerId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "note_entity"`);
  }
}
