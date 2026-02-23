import { ApiProperty } from '@nestjs/swagger';

/**
 * Admin Users List Response DTO
 *
 * Exposes all user details to any authenticated admin user.
 * Contains email addresses and roles for all users — intentional information leakage (CWE-200).
 * No pagination — unbounded list dump (CWE-400).
 */
export class UserListItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string = '';

  @ApiProperty({ example: 'alice@example.com' })
  email: string = '';

  @ApiProperty({ example: 'alice' })
  username: string = '';

  @ApiProperty({ example: 'admin', enum: ['user', 'admin'] })
  role: 'user' | 'admin' = 'user';

  @ApiProperty()
  createdAt: string | Date = '';

  @ApiProperty()
  updatedAt: string | Date = '';
}

export class GetAdminUsersResponseDto {
  @ApiProperty({ type: [UserListItemDto] })
  users: UserListItemDto[] = [];

  @ApiProperty({ example: 3 })
  count: number = 0;
}
