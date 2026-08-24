/**
 * Body for PUT /files/:id/approve (moderator/admin).
 * Authz via HasRoleGuard (DB role); audit trail on approval path where implemented.
 */
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ApproveFileDto {
  @IsEnum(['approved', 'rejected'], { message: 'status must be either "approved" or "rejected"' })
  @IsNotEmpty({ message: 'status is required' })
  status!: 'approved' | 'rejected';
}
