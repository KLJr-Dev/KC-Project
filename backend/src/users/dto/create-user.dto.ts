/**
 * v0.5.0 — Input Validation Pipeline: CreateUserDto
 *
 * Request body for POST /users (admin-only endpoint for user creation).
 *
 * v0.5.0 adds class-validator decorators; all fields required:
 * - email: @IsEmail
 * - username: @IsString, @MinLength(3), @MaxLength(50)
 * - password: @IsString, @MinLength(1) (CWE-521 weak)
 *
 * Admin-only endpoint; validation enforces schema per request (CWE-20).
 *
 * VULN (Intentional):
 *   - CWE-521: Password required min 1 char only
 */
import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

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
  @MinLength(1, { message: 'password must be at least 1 character' })
  @IsNotEmpty({ message: 'password is required' })
  password!: string;
}
