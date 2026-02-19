/**
 * v0.1.0 — User Model Introduced
 *
 * Response shape for user endpoints. Shape unchanged from v0.0.6.
 * Password is deliberately excluded — the User entity holds it
 * internally, but the service's toResponse() mapping strips it
 * before this DTO reaches the controller.
 *
 * v0.4.0: role field added. Returned by GET /auth/me and all user-related
 * endpoints. Allows frontend to display UI based on user privilege level.
 * VULN (v0.4.0): The role is taken from the JWT payload and NOT re-validated
 *       from the database during v0.4.0-v0.4.2, enabling privilege escalation.
 *       CWE-639 (Client-Controlled Authorization) | A07:2025
 */
export class UserResponseDto {
  id!: string;
  email?: string;
  username?: string;
  role?: 'user' | 'admin'; // v0.4.0: included in all user responses
  createdAt!: string;
  updatedAt!: string;
}
