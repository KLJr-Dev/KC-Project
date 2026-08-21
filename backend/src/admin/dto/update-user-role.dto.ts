import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

/**
 * M5 / v2.0.0 — UpdateUserRoleDto (PUT /admin/users/:id/role).
 *
 * DTO only validates enum membership. Rank enforcement lives in AdminService
 * via ROLE_RANK / canAssignRole (CWE-841) after loading the actor from the DB.
 */
export class UpdateUserRoleDto {
  @ApiProperty({ example: 'admin', enum: ['user', 'moderator', 'admin'] })
  @IsEnum(['user', 'moderator', 'admin'], {
    message: 'role must be one of: user, moderator, admin',
  })
  @IsNotEmpty({ message: 'role is required' })
  role!: 'user' | 'moderator' | 'admin';
}
