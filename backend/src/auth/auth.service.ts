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
import { logAuthEvent, truncateSecret } from '../common/logging.util';

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
 *       CWE-256 (Plaintext Storage of a Password) | A07:2025
 *
 * VULN (v0.1.2): Passwords compared as plaintext (=== operator).
 *       CWE-256 | A07:2025
 *
 * VULN (v0.1.2): Distinct error messages enable user enumeration.
 *       CWE-204 (Observable Response Discrepancy) | A07:2025
 *
 * VULN (v0.1.3): JWTs signed with hardcoded weak secret, no expiration.
 *       CWE-347 | A04:2025, CWE-613 | A07:2025
 *
 * VULN (v0.1.4): logout() does nothing server-side. Token replay possible.
 *       CWE-613 | A07:2025
 *
 * VULN (v0.1.5): No rate limiting, no account lockout, weak passwords accepted.
 *       CWE-307 | A07:2025, CWE-521 | A07:2025
 *
 * VULN (v0.4.0): Role claim included in JWT payload and trusted without
 *       server-side re-validation (CWE-639). An attacker knowing the weak
 *       JWT secret ('kc-secret') can forge a JWT with 'admin' role.
 *       Remediation (v2.4.0): Guards re-validate role from the database.
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
   *
   * v0.4.0: JWT payload includes role claim (CWE-639).
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const { email, username, password } = dto;

    if (!email || !username || !password) {
      throw new BadRequestException('Missing required registration fields');
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Unable to register with the provided details');
    }

    const created = await this.usersService.create({
      email,
      username,
      password, // plaintext until later hardening waves
    });

    const token = this.jwtService.sign({ sub: created.id, role: created.role });

    return {
      token,
      userId: created.id,
      message: 'Registration success',
    };
  }

  /**
   * POST /auth/login — Verify credentials and issue a JWT.
   *
   * Reads plaintext password from PostgreSQL and compares with ===.
   *
   * v0.4.0: JWT payload includes role claim (CWE-639).
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = dto;

    if (!email || !password) {
      throw new BadRequestException('Missing required login fields');
    }

    const user = await this.usersService.findEntityByEmail(email);
    // Identical message for unknown email and wrong password (no enumeration).
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id, role: user.role });

    logAuthEvent('login', {
      userId: user.id,
      email: user.email,
      token: truncateSecret(token),
    });

    return {
      token,
      userId: user.id,
      message: 'Login success',
    };
  }

  /**
   * GET /auth/me — Retrieve the profile of the currently authenticated user.
   */
  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * POST /auth/logout — Client-side clear only until M4 refresh revoke.
   */
  logout(): { message: string } {
    logAuthEvent('logout', { note: 'client-side only until refresh revoke' });
    return {
      message: 'Logged out',
    };
  }
}
