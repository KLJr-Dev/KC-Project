import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

/**
 * v0.1.2 — Login Endpoint
 *
 * Auth service handling registration (v0.1.1) and login (v0.1.2).
 * Passwords are stored and compared as plaintext (intentionally insecure).
 * Error messages are intentionally distinct to enable user enumeration.
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

  /**
   * v0.1.2 — implementation for POST /auth/login.
   *
   * Behaviour:
   * - 400 if email or password missing
   * - 401 "No user with that email" if user not found (intentionally leaky)
   * - 401 "Incorrect password" if plaintext comparison fails (intentionally leaky)
   * - 201 on success: returns AuthResponseDto with stub token
   */
  login(dto: LoginDto): AuthResponseDto {
    const { email, password } = dto;

    if (!email || !password) {
      throw new BadRequestException(
        'Missing required login fields: email and password are both required (v0.1.2)',
      );
    }

    const user = this.usersService.findEntityByEmail(email);
    if (!user) {
      throw new UnauthorizedException(
        `No user with that email (v0.1.2)`,
      );
    }

    if (user.password !== password) {
      throw new UnauthorizedException(
        `Incorrect password (v0.1.2)`,
      );
    }

    return {
      token: `stub-token-${user.id}`,
      userId: user.id,
      message: 'Login success (v0.1.2)',
    };
  }
}
