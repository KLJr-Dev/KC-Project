/**
 * M5 / v2.0.0 — UpdateUserDto (PUT /users/:id).
 *
 * When `password` is present, the same strength rules as registration apply
 * (CWE-521). Omitted fields remain optional (@IsOptional).
 */
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import {
  PASSWORD_COMPLEXITY_MESSAGE,
  PASSWORD_COMPLEXITY_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MAX_LENGTH_MESSAGE,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
} from '../../auth/password-policy';

export class UpdateUserDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'username must be a string' })
  @MinLength(3, { message: 'username must be at least 3 characters' })
  @MaxLength(50, { message: 'username must not exceed 50 characters' })
  @IsOptional()
  username?: string;

  @IsString({ message: 'password must be a string' })
  @MinLength(PASSWORD_MIN_LENGTH, { message: PASSWORD_MIN_LENGTH_MESSAGE })
  @MaxLength(PASSWORD_MAX_LENGTH, { message: PASSWORD_MAX_LENGTH_MESSAGE })
  @Matches(PASSWORD_COMPLEXITY_REGEX, { message: PASSWORD_COMPLEXITY_MESSAGE })
  @IsOptional()
  password?: string;
}
