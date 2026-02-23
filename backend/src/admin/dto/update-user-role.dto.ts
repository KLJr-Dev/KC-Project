import { ApiProperty } from '@nestjs/swagger';

/**
 * Update User Role Request DTO
 *
 * CWE-862: No validation that the caller (admin) should be allowed to modify this specific user.
 * Any admin can change any user's role. In v0.4.1, this is expected behavior (admins have broad power).
 * However, no audit trail is kept, and role changes take effect immediately (v0.4.4 adds logging).
 */
export class UpdateUserRoleDto {
  @ApiProperty({ example: 'admin', enum: ['user', 'moderator', 'admin'] })
  role: 'user' | 'moderator' | 'admin' = 'user';
}
