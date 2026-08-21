import { MigrationInterface, QueryRunner } from 'typeorm';
import { DEMO_WELCOME_SHARE_TOKEN } from '../sharing/demo-share.constants';

/**
 * v2.0.0 — Rotate legacy share-1 token to unguessable DEMO_WELCOME_SHARE_TOKEN.
 */
export class RotateDemoShareToken1777320000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "sharing_entity"
       SET "publicToken" = $1, "public" = true, "fileId" = '9101', "ownerId" = '9001'
       WHERE id = '1' OR "publicToken" = 'share-1'`,
      [DEMO_WELCOME_SHARE_TOKEN],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "sharing_entity"
       SET "publicToken" = 'share-1'
       WHERE "publicToken" = $1`,
      [DEMO_WELCOME_SHARE_TOKEN],
    );
  }
}
