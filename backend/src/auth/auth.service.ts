import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Auth service. Returns mock/placeholder responses only; no persistence, no
 * real login or token generation. Structure only; behaviour in v0.1.x.
 *
 * --- NestJS convention: Service = business logic ---
 * Same as admin: controller delegates here. Later we'll add user lookup,
 * password check, token creation; the controller stays thin and only calls
 * register() / login().
 */
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  /**
   * v0.1.1 — implementation for POST /auth/register functions.
   *
   * Behaviour:
   * - 400 code for Bad Request if any required fields are missing
   * - 409 code for Conflict if a user with the same email already exists (intentionally leaky message)
   * - 201 code for success: creates user via UsersService and returns AuthResponseDto with stub token
   */
  register(dto: RegisterDto): AuthResponseDto {
    const { email, username, password } = dto;

    if (!email || !username || !password) {
      throw new BadRequestException(
        'Missing required registration fields: email, username, and password are all required (v0.1.1)',
      );
    }

    const existing = this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException(
        `User with email ${email} already exists (weak duplicate check, v0.1.1)`,
      );
    }

    const created = this.usersService.create({
      email,
      username,
      password,
    });

    return {
      token: `stub-token-${created.id}`,
      userId: created.id,
      message: 'Registration success (v0.1.1)',
    };
  }

  /** v0.0.6 — stub for POST /auth/login. Ignores input; returns mock success. */
  login(_dto: LoginDto): AuthResponseDto {
    return {
      token: 'stub-token-login',
      userId: '1',
      message: 'Login stub (v0.0.6)',
    };
  }
}
