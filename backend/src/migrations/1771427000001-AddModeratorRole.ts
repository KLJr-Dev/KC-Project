import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * v0.4.3 -- Add 'moderator' role to user_role_enum.
 *
 * Expands role system from binary (user, admin) to ternary (user, moderator, admin).
 * Introduces moderator as an intermediate privilege level with file approval permissions.
 *
 * VULN (v0.4.3): The role hierarchy is intentionally ambiguous. No explicit
 *       ranking or permissions matrix defines whether moderator is subordinate
 *       to admin or equal. This leads to CWE-841 (Improper Restriction of
 *       Rendered UI Layers or Frames) and potential privilege confusion.
 *       CWE-639 (Client-Controlled Authorization) extends to moderator role —
 *       a forged JWT with role='moderator' will be trusted by HasRole guard
 *       and allow file approval operations.
 *       Remediation (v2.x): Explicit role hierarchy constants, per-endpoint
 *       permissions matrix, database re-validation of role on every action.
 */
export class AddModeratorRole1771427000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL doesn't allow direct ALTER TYPE ADD VALUE in transactions
    // So we must drop and recreate the enum, or use a different approach
    // Here we'll use ALTER TYPE ADD VALUE which requires careful handling

    // First, rename old enum type
    await queryRunner.query(
      `ALTER TYPE "user_role_enum" RENAME TO "user_role_enum_old"`,
    );

    // Create new enum with all three values
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM('user', 'moderator', 'admin')`,
    );

    // Alter column to use new enum (casting old values)
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "role" TYPE "user_role_enum" USING "role"::text::"user_role_enum"`,
    );

    // Drop old enum
    await queryRunner.query(
      `DROP TYPE "user_role_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to binary enum (remove any 'moderator' roles, but this will fail if any exist)
    // This is a destructive down migration — not ideal but matches the pattern of these intentional versions

    // Rename current enum
    await queryRunner.query(
      `ALTER TYPE "user_role_enum" RENAME TO "user_role_enum_old"`,
    );

    // Create binary enum
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM('user', 'admin')`,
    );

    // This will fail if any users have role='moderator' — migration is not truly reversible
    // In a real scenario, we'd migrate moderator users back to 'user' or 'admin'
    try {
      await queryRunner.query(
        `ALTER TABLE "user" ALTER COLUMN "role" TYPE "user_role_enum" USING "role"::text::"user_role_enum"`,
      );
    } catch (err) {
      console.error('Down migration failed: moderator roles exist in database', err);
      throw err;
    }

    // Drop old enum
    await queryRunner.query(
      `DROP TYPE "user_role_enum_old"`,
    );
  }
}
