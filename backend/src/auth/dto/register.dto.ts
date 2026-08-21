/**
 * M5 / v2.0.0 — RegisterDto (POST /auth/register).
 *
 * Security measures:
 * - CWE-20: Email format + username length bounds via class-validator.
 * - CWE-521: Password strength policy (min 12, max 128, complexity) — see
 *   password-policy.ts. Weak passwords are rejected at the ValidationPipe
 *   before AuthService runs (400 with field errors).
 * - CWE-400: Max lengths prevent oversized payload abuse on hot auth paths.
 *
 * Password is still transmitted in the JSON body until M6/M7 (httpOnly + TLS);
 * hashing at rest is AuthService / UsersService (bcrypt), not this DTO.
 */
import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, Matches } from 'class-validator';
import {
  PASSWORD_COMPLEXITY_MESSAGE,
  PASSWORD_COMPLEXITY_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MAX_LENGTH_MESSAGE,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
} from '../password-policy';

export class RegisterDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty({ message: 'email is required' })
  email!: string;

  @IsString({ message: 'password must be a string' })
  @MinLength(PASSWORD_MIN_LENGTH, { message: PASSWORD_MIN_LENGTH_MESSAGE })
  @MaxLength(PASSWORD_MAX_LENGTH, { message: PASSWORD_MAX_LENGTH_MESSAGE })
  @Matches(PASSWORD_COMPLEXITY_REGEX, { message: PASSWORD_COMPLEXITY_MESSAGE })
  @IsNotEmpty({ message: 'password is required' })
  password!: string;

  @IsString({ message: 'username must be a string' })
  @MinLength(3, { message: 'username must be at least 3 characters' })
  @MaxLength(50, { message: 'username must not exceed 50 characters' })
  @IsNotEmpty({ message: 'username is required' })
  username!: string;
}
