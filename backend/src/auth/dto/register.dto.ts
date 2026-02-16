/**
 * v0.1.1 — Registration Endpoint
 *
 * Request body for POST /auth/register.
 * Fields are now required to support basic validation and tests for:
 * - 201 code for successful registration
 * - 400 code when required fields are missing
 * - 409 code on weak duplicate email handling
 *
 * --- Why a dedicated Register DTO? ---
 * Register often carries more than login (e.g. username, email, password).
 * Keeping it separate from LoginDto makes the API contract clear and allows
 * different validation rules will be added later.
 */
export class RegisterDto {
  email!: string;
  password!: string;
  username!: string;
}
