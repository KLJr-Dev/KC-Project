/**
 * M5 / v2.0.0 — LoginDto (POST /auth/login).
 *
 * Security measures:
 * - CWE-20: Email format validated.
 * - CWE-400: Password max length 128 bounds bcrypt CPU on absurd payloads
 *   (login does not enforce strength — users already registered under policy).
 * - Rate limiting remains M8; generic auth errors remain M3.
 */
import { IsEmail, IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { PASSWORD_MAX_LENGTH, PASSWORD_MAX_LENGTH_MESSAGE } from '../password-policy';

export class LoginDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty({ message: 'email is required' })
  email!: string;

  @IsString({ message: 'password must be a string' })
  @MaxLength(PASSWORD_MAX_LENGTH, { message: PASSWORD_MAX_LENGTH_MESSAGE })
  @IsNotEmpty({ message: 'password is required' })
  password!: string;
}
