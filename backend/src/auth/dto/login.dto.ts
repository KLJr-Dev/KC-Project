/**
 * v0.5.0 — Input Validation Pipeline: LoginDto
 *
 * Request body for POST /auth/login.
 *
 * v0.5.0 adds class-validator decorators:
 * - email: @IsEmail (format validation)
 * - password: @IsString (type check, no constraints — CWE-521 weak)
 *
 * ValidationPipe enforces field presence and format; malformed requests
 * return 400 Bad Request with error details.
 *
 * VULN (Intentional):
 *   - CWE-521: Password has no min/max length constraints
 *   - CWE-639: No rate limiting; accounts enumerable via timing attacks
 */
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty({ message: 'email is required' })
  email!: string;

  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'password is required' })
  password!: string;
}
