/**
 * v0.1.5 — Authentication Edge Cases
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
 * different validation rules per endpoint.
 *
 * VULN: No class-validator decorators and no ValidationPipe. These fields
 *       have no constraints — password accepts any non-empty string ("a",
 *       "1", " "), email accepts any string (no format validation on the
 *       backend), and username has no length limit. The only validation is
 *       the manual `if (!email || !username || !password)` check in
 *       AuthService.register(), which only checks for falsy values.
 *       CWE-521 (Weak Password Requirements) | A07:2021
 *       CWE-20 (Improper Input Validation) | A03:2021
 *       Remediation (v2.0.0): Add class-validator decorators (@IsEmail,
 *       @MinLength(12), @Matches for complexity), enable ValidationPipe
 *       globally in main.ts.
 */
export class RegisterDto {
  email!: string;
  password!: string;
  username!: string;
}
