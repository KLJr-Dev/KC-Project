import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * v0.2.5 — Add description column to file_entity.
 *
 * Demonstrates the migration workflow: schema changes via explicit
 * migrations rather than synchronize: true.
 */
export class AddFileDescription1771408810362 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file_entity" ADD COLUMN IF NOT EXISTS "description" varchar`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file_entity" DROP COLUMN IF EXISTS "description"`);
  }
}
