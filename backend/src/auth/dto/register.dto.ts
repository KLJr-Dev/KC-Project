/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Request body for POST /auth/register. Stub only; validation minimal/absent.
 * Fields define the contract for user registration. Real validation and
 * duplicate handling come in v0.1.x.
 *
 * --- Why a dedicated Register DTO? ---
 * Register often carries more than login (e.g. username, email, password).
 * Keeping it separate from LoginDto makes the API contract clear and allows
 * different validation rules later. We use optional fields for v0.0.6 shape
 * only.
 */
export class RegisterDto {
  email?: string;
  password?: string;
  username?: string;
}
