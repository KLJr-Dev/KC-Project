import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { JwtPayload } from './jwt-payload.interface';

/**
 * v0.1.5 — Authentication Edge Cases
 *
 * Auth controller — thin HTTP layer for authentication endpoints.
 * All business logic lives in AuthService; the controller only handles
 * HTTP concerns (routing, status codes, request/response binding).
 *
 * Routes:
 *   POST /auth/register  → Create account + receive JWT     (public)
 *   POST /auth/login     → Verify credentials + receive JWT (public)
 *   GET  /auth/me        → Retrieve own profile             (protected)
 *   POST /auth/logout    → Cosmetic logout, no invalidation (protected)
 *
 * --- NestJS convention: Controller as HTTP adapter ---
 * Controllers are deliberately thin. They:
 *   - Declare routes via decorators (@Post, @Get, @Controller)
 *   - Bind request data to DTOs via @Body()
 *   - Delegate to services for logic
 *   - Return the service result (NestJS serialises it to JSON)
 *
 * The controller injects only AuthService. It does NOT inject UsersService
 * directly — profile lookup goes through AuthService.getProfile() to keep
 * this layer minimal.
 *
 * --- Guard usage ---
 * @UseGuards(JwtAuthGuard) on GET /auth/me causes NestJS to run the
 * guard's canActivate() before the route handler. If the guard throws
 * (missing/invalid token), the handler never executes and the client
 * receives a 401. The guard sets request.user, which @CurrentUser()
 * extracts as a JwtPayload.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register — Public endpoint.
   *
   * Accepts RegisterDto (email, username, password) in the request body.
   * Delegates to AuthService.register() which creates the user and signs
   * a JWT. Returns 201 with AuthResponseDto { token, userId, message }.
   *
   * No authentication required — anyone can register.
   *
   * VULN: No rate limiting — unlimited registration attempts per second.
   *       An attacker can mass-register accounts or enumerate existing emails
   *       via the 409 response (CWE-209) without any throttling.
   *       CWE-307 (Improper Restriction of Excessive Authentication Attempts) | A07:2021
   */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login — Public endpoint.
   *
   * Accepts LoginDto (email, password) in the request body. Delegates to
   * AuthService.login() which verifies credentials and signs a JWT.
   * Returns 201 with AuthResponseDto { token, userId, message }.
   *
   * No authentication required — anyone can attempt login.
   *
   * VULN: No rate limiting and no account lockout — unlimited login attempts.
   *       An attacker can brute-force passwords at full speed. After any
   *       number of wrong attempts, the correct password still works.
   *       CWE-307 (Improper Restriction of Excessive Authentication Attempts) | A07:2021
   */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * GET /auth/me — Protected endpoint (requires valid JWT).
   *
   * First protected route in the application. Proves that the JWT-based
   * session concept works end-to-end: the client sends a Bearer token,
   * the guard verifies it, and the controller returns the user's profile.
   *
   * Flow:
   *   1. JwtAuthGuard.canActivate() verifies the Bearer token
   *   2. Guard sets request.user = decoded JwtPayload { sub, iat }
   *   3. @CurrentUser() extracts the payload as a typed parameter
   *   4. AuthService.getProfile(user.sub) looks up the user by ID
   *   5. Returns UserResponseDto { id, email, username } (no password)
   *
   * VULN: No scope or permission check beyond token validity. Any valid
   *       token grants access to the profile — there is no concept of
   *       "this token is only allowed to do X." In a real app, this would
   *       need role-based or scope-based authorization.
   *       CWE-862 (Missing Authorization) | A01:2021 Broken Access Control
   *       Remediation (v2.0.0): RBAC middleware checking user.role against
   *       required permissions per route.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }

  /**
   * POST /auth/logout — Protected endpoint (requires valid JWT).
   *
   * Accepts a valid JWT and returns 201 with a success message.
   * INTENTIONALLY does nothing server-side — the JWT is not revoked,
   * deny-listed, or tracked in any way. The client is expected to clear
   * its own localStorage, but the token remains usable by anyone who
   * has a copy.
   *
   * This is the core v0.1.4 vulnerability: the logout is cosmetic.
   * The 201 response gives the user a false sense of security — they
   * believe they are "logged out" but an attacker who stole the JWT
   * before (or during) logout retains indefinite access.
   *
   * Why it requires a valid token:
   *   Protecting the logout route with JwtAuthGuard is standard practice
   *   (you should only be able to logout if you're logged in). It also
   *   means the guard runs and validates the token — proving the token
   *   IS valid at the moment of logout, which makes the subsequent
   *   token replay test more meaningful.
   *
   * VULN: No session invalidation — logout is client-side only.
   *       CWE-613 (Insufficient Session Expiration) | A07:2021
   *       Remediation (v2.0.0): POST /auth/logout deletes the refresh
   *       token from the database. Short-lived access tokens (15 min)
   *       expire naturally. httpOnly cookie cleared via Set-Cookie maxAge=0.
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    return this.authService.logout();
  }
}
