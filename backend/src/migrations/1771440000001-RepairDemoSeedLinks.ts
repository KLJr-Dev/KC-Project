import { MigrationInterface, QueryRunner } from 'typeorm';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Ensures demo share-1 points at seeded welcome.txt (9101) even on DBs that
 * already had a stale share-1 from prior testing.
 */
export class RepairDemoSeedLinks1771440000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const welcomePath = join(uploadsDir, 'seed-welcome.txt');
    if (!existsSync(welcomePath)) {
      writeFileSync(welcomePath, 'Welcome to KC-Project demo.\n', 'utf8');
    }

    const fileExists: unknown[] = await queryRunner.query(
      `SELECT 1 FROM "file_entity" WHERE id = '9101' LIMIT 1`,
    );
    if (fileExists.length === 0) return;

    await queryRunner.query(
      `UPDATE "sharing_entity"
       SET "ownerId" = '9001', "fileId" = '9101', "publicToken" = 'share-1', "public" = true
       WHERE id = '1'`,
    );

    const share1: unknown[] = await queryRunner.query(
      `SELECT 1 FROM "sharing_entity" WHERE "publicToken" = 'share-1' LIMIT 1`,
    );
    if (share1.length === 0) {
      const now = new Date().toISOString();
      await queryRunner.query(
        `INSERT INTO "sharing_entity"
          (id, "ownerId", "fileId", "publicToken", "public", "createdAt", "expiresAt")
         VALUES ('1', '9001', '9101', 'share-1', true, $1, '')`,
        [now],
      );
    }
  }

  public async down(): Promise<void> {
    /* repair migration — no down */
  }
}
