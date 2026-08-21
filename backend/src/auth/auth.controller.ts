/**
 * M6/M8 / v2.0.0 — AuthController (register / login / refresh / logout / me).
 *
 * Security measures:
 * - CWE-922: Refresh token set as httpOnly cookie (cookie.util); never left
 *   in the JSON body returned to the browser.
 * - CWE-352: POST /auth/refresh requires X-Requested-With (csrf.util).
 * - CWE-613: logout revokes DB refresh rows and clears the cookie.
 * - CWE-307: @Throttle tightens login/register/refresh (nginx also limit_req).
 *
 * Cookie Path is `/api/auth` (public nginx path). Express path on the Nest
 * app remains `/auth/*` because nginx strips the `/api` prefix.
 */
import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { JwtPayload } from './jwt-payload.interface';
import { AuthResponseDto } from './dto/auth-response.dto';
import { clearRefreshCookie, REFRESH_COOKIE_NAME, setRefreshCookie } from './cookie.util';
import { assertCsrfHeader } from './csrf.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Attach refresh cookie; return access JWT + userId only. */
  private writeSession(res: Response, session: AuthResponseDto): AuthResponseDto {
    if (session.refreshToken) {
      setRefreshCookie(res, session.refreshToken);
    }
    return {
      token: session.token,
      userId: session.userId,
      message: session.message,
    };
  }

  @Post('register')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.authService.register(dto);
    return this.writeSession(res, session);
  }

  @Post('login')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.authService.login(dto);
    return this.writeSession(res, session);
  }

  /**
   * Rotate refresh: cookie preferred, body fallback for non-browser clients.
   * Always requires CSRF header when a cookie-based session is used; we
   * require the header unconditionally so posture is consistent.
   */
  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    assertCsrfHeader(req);
    const fromCookie =
      typeof req.cookies?.[REFRESH_COOKIE_NAME] === 'string'
        ? (req.cookies[REFRESH_COOKIE_NAME] as string)
        : undefined;
    const raw = fromCookie || dto.refreshToken || '';
    try {
      const session = await this.authService.refresh(raw);
      return this.writeSession(res, session);
    } catch (err) {
      clearRefreshCookie(res);
      throw err;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(user.sub);
    clearRefreshCookie(res);
    return result;
  }
}
