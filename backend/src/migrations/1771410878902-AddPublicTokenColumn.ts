import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * v0.3.4 -- Add publicToken column to sharing_entity.
 *
 * Supports predictable public share tokens for unauthenticated downloads.
 */
export class AddPublicTokenColumn1771410878902 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sharing_entity" ADD COLUMN IF NOT EXISTS "publicToken" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sharing_entity" DROP COLUMN IF EXISTS "publicToken"`,
    );
  }
}
