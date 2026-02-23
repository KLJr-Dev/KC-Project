import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * v0.4.3 -- Add approvalStatus column to file_entity table.
 *
 * Introduces file approval workflow. Files default to 'pending' approval.
 * Moderators and admins can approve/reject files via PUT /files/:id/approve.
 *
 * VULN (v0.4.3): The file approval endpoint has no ownership check.
 *       A moderator can approve ANY file, not just files they own or uploaded.
 *       This demonstrates CWE-862 (Missing Authorization) on the approval action.
 *       Combined with CWE-639 (forged JWT role claim), an attacker with knowledge
 *       of the JWT secret can forge a 'moderator' token and approve arbitrary files.
 *       Remediation (v2.0.0): Check file.ownerId or implementoperator consent model.
 */
export class AddApprovalStatusToFile1771427000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for approval status
    await queryRunner.query(
      `DO $$
         BEGIN
           IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'file_approval_enum') THEN
             CREATE TYPE "file_approval_enum" AS ENUM('pending', 'approved', 'rejected');
           END IF;
         END
       $$;`,
    );

    // Add approval status column with default 'pending'
    await queryRunner.query(
      `ALTER TABLE "file_entity" ADD COLUMN IF NOT EXISTS "approvalStatus" "file_approval_enum" NOT NULL DEFAULT 'pending'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop approval status column
    await queryRunner.query(
      `ALTER TABLE "file_entity" DROP COLUMN IF EXISTS "approvalStatus"`,
    );

    // Drop enum type
    await queryRunner.query(
      `DROP TYPE IF EXISTS "file_approval_enum"`,
    );
  }
}
