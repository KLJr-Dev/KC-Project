import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

/**
 * v0.5.0 — Input Validation Pipeline: UpdateUserRoleDto
 *
 * Request body for PUT /admin/users/:id/role (admin-only).
 *
 * v0.5.0 adds validators:
 * - role: @IsEnum(['user', 'moderator', 'admin']) (enum validation)
 *
 * VULN (Intentional):
 *   - CWE-862 (Missing Authorization): Any authenticated admin can change any user's role
 *   - CWE-639 (IDOR): No ownership/hierarchy checks; admins can modify other admins
 *   - CWE-841 (Role Abuse): Ternary role system creates ambiguity in moderator permissions
 */
export class UpdateUserRoleDto {
  @ApiProperty({ example: 'admin', enum: ['user', 'moderator', 'admin'] })
  @IsEnum(['user', 'moderator', 'admin'], { message: 'role must be one of: user, moderator, admin' })
  @IsNotEmpty({ message: 'role is required' })
  role!: 'user' | 'moderator' | 'admin';
}
