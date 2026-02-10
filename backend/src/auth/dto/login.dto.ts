/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Request body for POST /auth/login. Stub only; validation minimal/absent.
 * Real login logic (and weak password handling) comes in v0.1.x.
 *
 * --- Why separate from RegisterDto? ---
 * Login typically needs only credentials (e.g. email + password). Reusing
 * RegisterDto would imply optional username and blur the contract. Separate
 * DTOs keep each route’s expectations explicit.
 */
export class LoginDto {
  email?: string;
  password?: string;
}
