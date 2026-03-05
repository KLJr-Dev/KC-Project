/**
 * v0.5.0 — Input Validation Pipeline: UpdateUserDto
 *
 * Request body for PUT /users/:id. All fields optional (partial shape).
 *
 * v0.5.0 adds class-validator decorators:
 * - email: @IsEmail (if provided)
 * - username: @IsString, @MinLength(3), @MaxLength(50) (if provided)
 * - password: @IsString, @MinLength(1) (if provided, CWE-521 weak)
 *
 * @IsOptional allows field omission; if provided, field constraints apply.
 *
 * VULN (Intentional):
 *   - CWE-20: Optional fields allow selective updates
 *   - CWE-521: Password (if updated) requires only 1 char minimum
 */
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

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
  @MinLength(1, { message: 'password must be at least 1 character' })
  @IsOptional()
  password?: string;
}
