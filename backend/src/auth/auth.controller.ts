import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { JwtPayload } from './jwt-payload.interface';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Auth controller — thin HTTP layer for authentication endpoints.
 * All handlers are now async because AuthService hits PostgreSQL
 * via UsersService.
 *
 * Routes:
 *   POST /auth/register  → Create account + receive JWT     (public)
 *   POST /auth/login     → Verify credentials + receive JWT (public)
 *   GET  /auth/me        → Retrieve own profile             (protected)
 *   POST /auth/logout    → Cosmetic logout, no invalidation (protected)
 *
 * All v0.1.x vulnerabilities carried forward (CWE-307, CWE-521, CWE-204,
 * CWE-256, CWE-347, CWE-613, CWE-798, CWE-862).
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /auth/register — Public. No rate limiting (CWE-307). */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** POST /auth/login — Public. No rate limiting, no lockout (CWE-307). */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** GET /auth/me — Protected. Returns user profile from DB. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }

  /**
   * POST /auth/logout — Protected. Intentionally does nothing server-side.
   * VULN: CWE-613 — token remains valid after logout.
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    return this.authService.logout();
  }
}
