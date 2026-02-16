/**
 * v0.1.2 — Login Endpoint
 *
 * Request body for POST /auth/login. Both fields required.
 *
 * --- Why separate from RegisterDto? ---
 * Login typically needs only credentials (email + password). Reusing
 * RegisterDto would imply optional username and blur the contract. Separate
 * DTOs keep each route's expectations explicit.
 */
export class LoginDto {
  email!: string;
  password!: string;
}
