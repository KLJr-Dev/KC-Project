/**
 * v0.5.0 — Input Validation Pipeline: RegisterDto
 *
 * Request body for POST /auth/register.
 *
 * v0.5.0 adds class-validator decorators for field-level validation:
 * - email: @IsEmail (format validation, CWE-20 partial mitigation)
 * - username: @IsString, @MinLength(3), @MaxLength(50) (strong constraints)
 * - password: @IsString, @MinLength(1) ONLY (CWE-521 Weak Passwords — intentional)
 *
 * ValidationPipe (registered in main.ts) validates all incoming requests;
 * malformed input returns 400 Bad Request with field-level error details.
 *
 * VULN (Intentional):
 *   - CWE-521: Password requires only 1 character minimum; no complexity, no max length
 *   - CWE-20: Email format validated, but usernames not enumerated, no rate limiting
 *   - CWE-1025: Type mismatch exposure — if client sends "username" as number,
 *     strict validation rejects it (no auto-convert)
 */
import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty({ message: 'email is required' })
  email!: string;

  @IsString({ message: 'password must be a string' })
  @MinLength(1, { message: 'password must be at least 1 character' })
  @IsNotEmpty({ message: 'password is required' })
  password!: string;

  @IsString({ message: 'username must be a string' })
  @MinLength(3, { message: 'username must be at least 3 characters' })
  @MaxLength(50, { message: 'username must not exceed 50 characters' })
  @IsNotEmpty({ message: 'username is required' })
  username!: string;
}
