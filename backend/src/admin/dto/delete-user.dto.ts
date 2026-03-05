/**
 * v0.5.0 — Input Validation Pipeline: DeleteUserDto
 *
 * Request body for DELETE /admin/users/:id (admin-only endpoint).
 * DTO is intentionally empty; delete logic uses only path parameter (userId).
 *
 * VULN (Intentional):
 *   - CWE-862 (Missing Authorization): Endpoint lacks proper guard validation
 *     (v0.4.5 — HasRole guard missing on DELETE endpoint)
 *   - CWE-532: No audit trail; deletion not logged
 */
export class DeleteUserDto {
  // Currently empty — no request body required
  // Future (v1.0.0 remediation): Could add a reason or confirmation field
}
