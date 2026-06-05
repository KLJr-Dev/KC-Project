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

  @ApiProperty({ example: 'admin', enum: ['user', 'moderator', 'admin'] })
  role: 'user' | 'moderator' | 'admin' = 'user';

  @ApiProperty()
  createdAt: string | Date = '';

  @ApiProperty()
  updatedAt: string | Date = '';
}

export class GetAdminUsersResponseDto {
  @ApiProperty({ type: [UserListItemDto] })
  items: UserListItemDto[] = [];

  @ApiProperty({ type: [UserListItemDto], description: 'Alias for items (backward compat)' })
  users: UserListItemDto[] = [];

  @ApiProperty({ example: 3 })
  total: number = 0;

  @ApiProperty({ example: 3, description: 'Alias for total (backward compat)' })
  count: number = 0;

  @ApiProperty({ example: 0 })
  skip: number = 0;

  @ApiProperty({ example: 20 })
  take: number = 20;
}
