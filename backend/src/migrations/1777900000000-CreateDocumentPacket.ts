/**
 * Cycle-10 SoftDev B6a — create `document_packet` for Nest packets API.
 *
 * Tip: intentional-insecure `v1.10.0` (ADR-039).
 * Entity: backend/src/packets/entities/document-packet.entity.ts
 * Does not touch kc_intake / Cycle-9 onboarding tables.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentPacket1777900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "document_packet" (
        "id" character varying NOT NULL,
        "ownerUserId" character varying NOT NULL,
        "originalName" character varying NOT NULL,
        "storageKey" character varying,
        "status" character varying NOT NULL DEFAULT 'accepted',
        "helperOutput" text,
        "createdAt" character varying NOT NULL,
        CONSTRAINT "PK_document_packet" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_document_packet_owner" ON "document_packet" ("ownerUserId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "document_packet"`);
  }
}
