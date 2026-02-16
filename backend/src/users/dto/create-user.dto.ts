/**
 * v0.1.0 — User Model Introduced
 *
 * Request body for POST /users. Shape unchanged from v0.0.6.
 * Fields are optional — validation is absent by design until v0.1.1+.
 * The password field is now stored on the User entity (plaintext,
 * intentionally insecure).
 */
export class CreateUserDto {
  email?: string;
  username?: string;
  password?: string;
}
