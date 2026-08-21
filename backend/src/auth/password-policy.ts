/**
 * M5 / v2.0.0 — Shared password strength policy (security-baseline CWE-521).
 *
 * Applied by RegisterDto, CreateUserDto, and UpdateUserDto (when password set).
 *
 * Security measures:
 * - Minimum length 12 (NIST SP 800-63B-aligned length floor for lab baseline).
 * - Maximum length 128 (DoS / bcrypt cost bound — CWE-400 adjacent).
 * - Complexity: at least one lower, upper, digit, and non-alphanumeric.
 *   (Lab teaching control; production products may prefer length-only + breach
 *   checks — keep policy centralized here so DTOs stay consistent.)
 *
 * Import these constants into class-validator decorators; do not duplicate magic
 * numbers across DTO files.
 */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

/** Requires lower, upper, digit, and special (non [A-Za-z0-9]). */
export const PASSWORD_COMPLEXITY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const PASSWORD_MIN_LENGTH_MESSAGE = `password must be at least ${PASSWORD_MIN_LENGTH} characters`;
export const PASSWORD_MAX_LENGTH_MESSAGE = `password must not exceed ${PASSWORD_MAX_LENGTH} characters`;
export const PASSWORD_COMPLEXITY_MESSAGE =
  'password must include uppercase, lowercase, a digit, and a special character';
