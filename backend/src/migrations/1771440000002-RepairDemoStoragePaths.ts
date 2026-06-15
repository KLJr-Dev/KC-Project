import { MigrationInterface, QueryRunner } from 'typeorm';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Fixes demo file storagePath when DB was seeded from a different cwd (e.g. host
 * e2e vs Docker /app). Ensures share-1 download works in the prod container.
 */
export class RepairDemoStoragePaths1771440000002 implements MigrationInterface {
  private readonly diskFiles: Record<string, { disk: string; content: string }> = {
    '9101': { disk: 'seed-welcome.txt', content: 'Welcome to KC-Project demo.\n' },
    '9102': { disk: 'seed-pending-doc.pdf', content: '%PDF-1.4 demo\n' },
    '9103': { disk: 'seed-mod-notes.txt', content: 'Moderator private notes.\n' },
    '9104': { disk: 'seed-other-user-secret.txt', content: 'Secret file from another user.\n' },
  };

  public async up(queryRunner: QueryRunner): Promise<void> {
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    for (const [id, meta] of Object.entries(this.diskFiles)) {
      const storagePath = join(uploadsDir, meta.disk);
      if (!existsSync(storagePath)) {
        writeFileSync(storagePath, meta.content, 'utf8');
      }

      await queryRunner.query(`UPDATE "file_entity" SET "storagePath" = $1 WHERE id = $2`, [
        storagePath,
        id,
      ]);
    }
  }

  public async down(): Promise<void> {
    /* repair migration — no down */
  }
}
