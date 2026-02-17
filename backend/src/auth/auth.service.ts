import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { UserResponseDto } from '../users/dto/user-response.dto';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Core authentication business logic. All methods are now async because
 * UsersService methods hit PostgreSQL via TypeORM repositories.
 *
 * Handles:
 *   - register()    → create user + issue JWT          (POST /auth/register)
 *   - login()       → verify credentials + issue JWT   (POST /auth/login)
 *   - getProfile()  → look up user by ID from token    (GET /auth/me)
 *   - logout()      → intentionally does nothing        (POST /auth/logout)
 *
 * --- Intentional vulnerabilities (carried from v0.1.x, now persistent) ---
 *
 * VULN (v0.1.1): Passwords stored as plaintext in the database.
 *       CWE-256 (Plaintext Storage of a Password) | A07:2021
 *
 * VULN (v0.1.2): Passwords compared as plaintext (=== operator).
 *       CWE-256 | A07:2021
 *
 * VULN (v0.1.2): Distinct error messages enable user enumeration.
 *       CWE-204 (Observable Response Discrepancy) | A07:2021
 *
 * VULN (v0.1.3): JWTs signed with hardcoded weak secret, no expiration.
 *       CWE-347 | A02:2021, CWE-613 | A07:2021
 *
 * VULN (v0.1.4): logout() does nothing server-side. Token replay possible.
 *       CWE-613 | A07:2021
 *
 * VULN (v0.1.5): No rate limiting, no account lockout, weak passwords accepted.
 *       CWE-307 | A07:2021, CWE-521 | A07:2021
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * POST /auth/register — Create a new user and issue a JWT.
   *
   * Now persists the user to PostgreSQL. Plaintext password is written
   * directly to the database column (CWE-256).
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const { email, username, password } = dto;

    if (!email || !username || !password) {
      throw new BadRequestException(
        'Missing required registration fields: email, username, and password are all required (v0.1.1)',
      );
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      // VULN: error message includes the email — information disclosure (CWE-209)
      throw new ConflictException(
        `User with email ${email} already exists (weak duplicate check, v0.1.1)`,
      );
    }

    const created = await this.usersService.create({
      email,
      username,
      password, // VULN: stored as plaintext in PostgreSQL (CWE-256)
    });

    // VULN: JWT signed with weak hardcoded secret, no expiry (CWE-347, CWE-613)
    const token = this.jwtService.sign({ sub: created.id });

    return {
      token,
      userId: created.id,
      message: 'Registration success (v0.2.0)',
    };
  }

  /**
   * POST /auth/login — Verify credentials and issue a JWT.
   *
   * Reads plaintext password from PostgreSQL and compares with ===.
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = dto;

    if (!email || !password) {
      throw new BadRequestException(
        'Missing required login fields: email and password are both required (v0.1.2)',
      );
    }

    const user = await this.usersService.findEntityByEmail(email);
    if (!user) {
      // VULN: distinct error reveals that this email is not registered (CWE-204)
      throw new UnauthorizedException(
        `No user with that email (v0.1.2)`,
      );
    }

    // VULN: plaintext password comparison — no hashing (CWE-256)
    if (user.password !== password) {
      // VULN: distinct error reveals that the email IS registered (CWE-204)
      throw new UnauthorizedException(
        `Incorrect password (v0.1.2)`,
      );
    }

    // VULN: JWT signed with weak hardcoded secret, no expiry (CWE-347, CWE-613)
    const token = this.jwtService.sign({ sub: user.id });

    return {
      token,
      userId: user.id,
      message: 'Login success (v0.2.0)',
    };
  }

  /**
   * GET /auth/me — Retrieve the profile of the currently authenticated user.
   */
  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(
        `User with ID ${userId} not found (v0.1.3)`,
      );
    }
    return user;
  }

  /**
   * POST /auth/logout — Intentionally does NOT invalidate the JWT.
   *
   * VULN: No server-side session tracking or token revocation.
   *       CWE-613 (Insufficient Session Expiration) | A07:2021
   */
  logout(): { message: string } {
    return {
      message: 'Logged out (client-side only, token still valid) (v0.1.4)',
    };
  }
}
