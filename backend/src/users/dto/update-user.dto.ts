/**
 * v0.1.0 — User Model Introduced
 *
 * Request body for PUT /users/:id. Partial shape — clients send only
 * fields they want to change. Password updates are now applied to the
 * User entity (plaintext, intentionally insecure).
 */
export class UpdateUserDto {
  email?: string;
  username?: string;
  password?: string;
}
