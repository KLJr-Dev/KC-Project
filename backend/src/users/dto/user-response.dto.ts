/**
 * User API response (password never included). Role from DB-backed profile.
 */
export class UserResponseDto {
  id!: string;
  email?: string;
  username?: string;
  role?: 'user' | 'moderator' | 'admin'; // v0.4.0: included in all user responses
  createdAt!: string;
  updatedAt!: string;
}
