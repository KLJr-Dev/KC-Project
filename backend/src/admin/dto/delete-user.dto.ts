/**
 * Delete User Request DTO (v0.4.5)
 *
 * CWE-862: Improper Access Control — Missing Authorization
 *
 * This DTO is simple (nearly empty) because the delete endpoint intentionally
 * lacks role-based authorization checks. The endpoint only uses JwtAuthGuard,
 * allowing any authenticated user to delete any other user.
 *
 * In a secure system, DELETE endpoints would require:
 * - Role check: @HasRole('admin')
 * - Ownership validation: Can user delete themselves? Others?
 * - Soft-delete or audit trail: Track deletion timestamps and who deleted whom
 *
 * This endpoint demonstrates intentional CWE-862 by omitting all three.
 */
export class DeleteUserDto {
  // Currently empty — no request body required
  // Future (v1.0.0 remediation): Could add a reason or confirmation field
}
