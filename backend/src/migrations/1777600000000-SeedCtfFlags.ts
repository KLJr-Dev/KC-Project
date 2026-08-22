import { MigrationInterface, QueryRunner } from 'typeorm';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcrypt';
import {
  buildLocalTxtBody,
  buildProofTxtBody,
  CTF_FILE_LOCAL_ID,
  CTF_FILE_PROOF_ID,
  CTF_FLAG_DB,
  CTF_LISA,
} from '../ctf/ctf.constants';

/**
 * v1.1.0 CTF — plant OSCP-style proofs (local.txt / proof.txt / ctf_flag) + hydra target lisa.
 * Runs on all stacks; breaks activate only when CTF_MODE=true.
 */
export class SeedCtfFlags1777600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const now = new Date().toISOString();
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const localBody = buildLocalTxtBody();
    const proofBody = buildProofTxtBody();
    const localDisk = join(uploadsDir, 'seed-local.txt');
    const proofDisk = join(uploadsDir, 'seed-proof.txt');
    writeFileSync(localDisk, localBody, 'utf8');
    writeFileSync(proofDisk, proofBody, 'utf8');

    const localExists: unknown[] = await queryRunner.query(
      `SELECT 1 FROM "file_entity" WHERE id = $1 LIMIT 1`,
      [CTF_FILE_LOCAL_ID],
    );
    if (localExists.length > 0) {
      await queryRunner.query(
        `UPDATE "file_entity"
         SET filename = $1, mimetype = $2, "storagePath" = $3, size = $4, "ownerId" = $5
         WHERE id = $6`,
        ['local.txt', 'text/plain', localDisk, Buffer.byteLength(localBody, 'utf8'), '9004', CTF_FILE_LOCAL_ID],
      );
    }

    const proofExists: unknown[] = await queryRunner.query(
      `SELECT 1 FROM "file_entity" WHERE id = $1 LIMIT 1`,
      [CTF_FILE_PROOF_ID],
    );
    if (proofExists.length === 0) {
      await queryRunner.query(
        `INSERT INTO "file_entity"
          (id, "ownerId", filename, mimetype, "storagePath", size, description, "approvalStatus", "uploadedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          CTF_FILE_PROOF_ID,
          '9003',
          'proof.txt',
          'text/plain',
          proofDisk,
          Buffer.byteLength(proofBody, 'utf8'),
          'CTF admin proof',
          'approved',
          now,
        ],
      );
    } else {
      await queryRunner.query(
        `UPDATE "file_entity"
         SET "ownerId" = $1, filename = $2, mimetype = $3, "storagePath" = $4, size = $5
         WHERE id = $6`,
        ['9003', 'proof.txt', 'text/plain', proofDisk, Buffer.byteLength(proofBody, 'utf8'), CTF_FILE_PROOF_ID],
      );
    }

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ctf_flag" (
        "name" varchar(64) PRIMARY KEY,
        "value" varchar(64) NOT NULL
      )
    `);
    await queryRunner.query(
      `INSERT INTO "ctf_flag" ("name", "value") VALUES ($1, $2)
       ON CONFLICT ("name") DO UPDATE SET "value" = EXCLUDED."value"`,
      ['proof', CTF_FLAG_DB],
    );

    const lisaExists: unknown[] = await queryRunner.query(
      `SELECT 1 FROM "user" WHERE email = $1 LIMIT 1`,
      [CTF_LISA.email],
    );
    if (lisaExists.length === 0) {
      const passwordHash = await bcrypt.hash(CTF_LISA.password, 12);
      await queryRunner.query(
        `INSERT INTO "user" (id, email, username, password, role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          CTF_LISA.id,
          CTF_LISA.email,
          CTF_LISA.username,
          passwordHash,
          CTF_LISA.role,
          now,
          now,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "user" WHERE email = $1`, [CTF_LISA.email]);
    await queryRunner.query(`DELETE FROM "ctf_flag" WHERE name = 'proof'`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ctf_flag"`);
    await queryRunner.query(`DELETE FROM "file_entity" WHERE id = $1`, [CTF_FILE_PROOF_ID]);
  }
}
