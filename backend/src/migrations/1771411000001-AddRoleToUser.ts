import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * v0.4.0 -- Add role column to user table.
 *
 * Introduces privilege levels (user, admin) for authorization surface.
 * Default value is 'user' for all existing and new users.
 *
 * VULN (v0.4.0): The role will be stored in the JWT payload during v0.4.0-v0.4.2
 *       and trusted without database validation. This enables privilege
 *       escalation attacks where the client can modify the JWT role claim.
 *       CWE-639 (Client-Controlled Authorization) | A07:2025
 *       Remediation (v2.4.0): Guards re-validate role from database on every request.
 */
export class AddRoleToUser1771411000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type if not already exists
    await queryRunner.query(
      `DO $$
         BEGIN
           IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
             CREATE TYPE "user_role_enum" AS ENUM('user', 'admin');
           END IF;
         END
       $$;`,
    );

    // Add role column with enum type and default value
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" "user_role_enum" NOT NULL DEFAULT 'user'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop role column
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "role"`,
    );

    // Drop enum type if no longer referenced
    await queryRunner.query(
      `DROP TYPE IF EXISTS "user_role_enum"`,
    );
  }
}
