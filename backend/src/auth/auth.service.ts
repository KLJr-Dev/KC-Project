import { Injectable } from '@nestjs/common';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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
  /** v0.0.6 — stub for POST /auth/register. Ignores input; returns mock success. */
  register(_dto: RegisterDto): AuthResponseDto {
    return {
      token: 'stub-token-register',
      userId: '1',
      message: 'Registration stub (v0.0.6)',
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
