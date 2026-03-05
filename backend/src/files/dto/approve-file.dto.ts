/**
 * v0.5.0 — Input Validation Pipeline: ApproveFileDto
 *
 * Request body for file approval endpoint (moderator-only).
 *
 * v0.5.0 adds validators:
 * - status: @IsEnum(['approved', 'rejected']) (enum validation)
 *
 * VULN (Intentional):
 *   - CWE-841 (Role Ambiguity): Moderator/admin hierarchy undefined
 *     Can moderator reject admin-approved file? Intentionally unclear.
 *   - CWE-532: No audit trail yet (v0.6.0 adds persistent audit logs)
 */
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ApproveFileDto {
  @IsEnum(['approved', 'rejected'], { message: 'status must be either "approved" or "rejected"' })
  @IsNotEmpty({ message: 'status is required' })
  status!: 'approved' | 'rejected';
}
