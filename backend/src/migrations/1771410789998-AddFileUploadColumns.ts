import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * v0.3.0 -- Add mimetype and storagePath columns to file_entity.
 *
 * Supports real multipart file uploads via Multer.
 */
export class AddFileUploadColumns1771410789998 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file_entity" ADD COLUMN IF NOT EXISTS "mimetype" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_entity" ADD COLUMN IF NOT EXISTS "storagePath" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file_entity" DROP COLUMN IF EXISTS "storagePath"`);
    await queryRunner.query(`ALTER TABLE "file_entity" DROP COLUMN IF EXISTS "mimetype"`);
  }
}
