/**
 * v0.1.0 — User Model Introduced
 *
 * Response shape for user endpoints. Shape unchanged from v0.0.6.
 * Password is deliberately excluded — the User entity holds it
 * internally, but the service's toResponse() mapping strips it
 * before this DTO reaches the controller.
 */
export class UserResponseDto {
  id!: string;
  email?: string;
  username?: string;
  createdAt!: string;
  updatedAt!: string;
}
