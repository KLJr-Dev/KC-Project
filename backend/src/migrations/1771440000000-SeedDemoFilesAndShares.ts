import { MigrationInterface, QueryRunner } from 'typeorm';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * v1.0.x — Demo files and shares for reproducible pentest / UX journeys.
 * See docs/deploy/demo-users.md and docs/deploy/pentest-journeys.md.
 */
export class SeedDemoFilesAndShares1771440000000 implements MigrationInterface {
  private readonly otherUser = {
    id: '9004',
    email: 'other@kc.test',
    username: 'demo_other',
    password: 'OtherPass123!',
    role: 'user',
  };

  private readonly demoFiles = [
    {
      id: '9101',
      ownerId: '9001',
      filename: 'seed-welcome.txt',
      displayName: 'welcome.txt',
      mimetype: 'text/plain',
      size: 28,
      approvalStatus: 'approved',
      content: 'Welcome to KC-Project demo.\n',
    },
    {
      id: '9102',
      ownerId: '9001',
      filename: 'seed-pending-doc.pdf',
      displayName: 'pending-doc.pdf',
      mimetype: 'application/pdf',
      size: 16,
      approvalStatus: 'pending',
      content: '%PDF-1.4 demo\n',
    },
    {
      id: '9103',
      ownerId: '9002',
      filename: 'seed-mod-notes.txt',
      displayName: 'mod-notes.txt',
      mimetype: 'text/plain',
      size: 22,
      approvalStatus: 'approved',
      content: 'Moderator private notes.\n',
    },
    {
      id: '9104',
      ownerId: '9004',
      filename: 'seed-other-user-secret.txt',
      displayName: 'other-user-secret.txt',
      mimetype: 'text/plain',
      size: 32,
      approvalStatus: 'approved',
      content: 'Secret file from another user.\n',
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const now = new Date().toISOString();
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const otherExists: unknown[] = await queryRunner.query(
      `SELECT 1 FROM "user" WHERE email = $1 LIMIT 1`,
      [this.otherUser.email],
    );
    if (otherExists.length === 0) {
      await queryRunner.query(
        `INSERT INTO "user" (id, email, username, password, role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5::user_role_enum, $6, $6)`,
        [
          this.otherUser.id,
          this.otherUser.email,
          this.otherUser.username,
          this.otherUser.password,
          this.otherUser.role,
          now,
        ],
      );
    }

    for (const f of this.demoFiles) {
      const existing: unknown[] = await queryRunner.query(
        `SELECT 1 FROM "file_entity" WHERE id = $1 LIMIT 1`,
        [f.id],
      );
      const storagePath = join(uploadsDir, f.filename);
      if (!existsSync(storagePath)) {
        writeFileSync(storagePath, f.content, 'utf8');
      }

      if (existing.length > 0) {
        await queryRunner.query(`UPDATE "file_entity" SET "storagePath" = $1 WHERE id = $2`, [
          storagePath,
          f.id,
        ]);
        continue;
      }

      await queryRunner.query(
        `INSERT INTO "file_entity"
          (id, "ownerId", filename, mimetype, "storagePath", size, description, "approvalStatus", "uploadedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::file_entity_approvalstatus_enum, $9)`,
        [
          f.id,
          f.ownerId,
          f.displayName,
          f.mimetype,
          storagePath,
          f.size,
          'Demo seed file',
          f.approvalStatus,
          now,
        ],
      );
    }

    const share1Exists: unknown[] = await queryRunner.query(
      `SELECT 1 FROM "sharing_entity" WHERE id = '1' LIMIT 1`,
    );
    if (share1Exists.length === 0) {
      await queryRunner.query(
        `INSERT INTO "sharing_entity"
          (id, "ownerId", "fileId", "publicToken", "public", "createdAt", "expiresAt")
         VALUES ('1', '9001', '9101', 'share-1', true, $1, '')`,
        [now],
      );
    } else {
      await queryRunner.query(
        `UPDATE "sharing_entity"
         SET "ownerId" = '9001', "fileId" = '9101', "publicToken" = 'share-1', "public" = true
         WHERE id = '1'`,
      );
    }

    const share2Exists: unknown[] = await queryRunner.query(
      `SELECT 1 FROM "sharing_entity" WHERE id = '2' LIMIT 1`,
    );
    if (share2Exists.length === 0) {
      await queryRunner.query(
        `INSERT INTO "sharing_entity"
          (id, "ownerId", "fileId", "publicToken", "public", "createdAt", "expiresAt")
         VALUES ('2', '9002', '9103', NULL, false, $1, '')`,
        [now],
      );
    } else {
      await queryRunner.query(
        `UPDATE "sharing_entity"
         SET "ownerId" = '9002', "fileId" = '9103', "publicToken" = NULL, "public" = false
         WHERE id = '2'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "sharing_entity" WHERE id IN ('1', '2')`);
    await queryRunner.query(
      `DELETE FROM "file_entity" WHERE id IN ('9101', '9102', '9103', '9104')`,
    );
    await queryRunner.query(`DELETE FROM "user" WHERE email = 'other@kc.test'`);
  }
}
