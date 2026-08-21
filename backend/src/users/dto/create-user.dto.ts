/**
 * M5 / v2.0.0 — CreateUserDto (POST /users).
 *
 * Same password policy as RegisterDto so admin-created accounts cannot bypass
 * CWE-521 controls that self-registration enforces.
 */
import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, Matches } from 'class-validator';
import {
  PASSWORD_COMPLEXITY_MESSAGE,
  PASSWORD_COMPLEXITY_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MAX_LENGTH_MESSAGE,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
} from '../../auth/password-policy';

export class CreateUserDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty({ message: 'email is required' })
  email!: string;

  @IsString({ message: 'username must be a string' })
  @MinLength(3, { message: 'username must be at least 3 characters' })
  @MaxLength(50, { message: 'username must not exceed 50 characters' })
  @IsNotEmpty({ message: 'username is required' })
  username!: string;

  @IsString({ message: 'password must be a string' })
  @MinLength(PASSWORD_MIN_LENGTH, { message: PASSWORD_MIN_LENGTH_MESSAGE })
  @MaxLength(PASSWORD_MAX_LENGTH, { message: PASSWORD_MAX_LENGTH_MESSAGE })
  @Matches(PASSWORD_COMPLEXITY_REGEX, { message: PASSWORD_COMPLEXITY_MESSAGE })
  @IsNotEmpty({ message: 'password is required' })
  password!: string;
}
