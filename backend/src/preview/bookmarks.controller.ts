import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { REFRESH_COOKIE_NAME } from '../auth/cookie.util';
import { BookmarksService } from './bookmarks.service';
import { PreviewDto } from './dto/preview.dto';

/**
 * Cookie-auth bookmarks under `/auth/bookmarks` (Cycle-6 CSRF plant / FC-02).
 *
 * Cookie Path is `/api/auth` so these routes receive `kc_refresh`.
 * **No** assertCsrfHeader on purpose (v1.3.0).
 * GET /auth/bookmarks/save works as classic CSRF via top-level navigation (SameSite=Lax).
 */
@Controller('auth/bookmarks')
export class BookmarksController {
  constructor(
    private readonly authService: AuthService,
    private readonly bookmarksService: BookmarksService,
  ) {}

  private async userIdFromCookie(req: Request): Promise<string> {
    const raw =
      typeof req.cookies?.[REFRESH_COOKIE_NAME] === 'string'
        ? (req.cookies[REFRESH_COOKIE_NAME] as string)
        : '';
    if (!raw) {
      throw new UnauthorizedException('Refresh cookie required');
    }
    return this.authService.resolveUserIdFromRefresh(raw);
  }

  /** CSRF-friendly state change (GET + cookie). */
  @Get('save')
  async saveGet(@Req() req: Request, @Query('url') url?: string) {
    if (!url || typeof url !== 'string') {
      throw new BadRequestException('url query required');
    }
    const userId = await this.userIdFromCookie(req);
    return this.bookmarksService.save(userId, url, null);
  }

  /** Same-site UI path — also without CSRF header (intentional). */
  @Post()
  async savePost(@Req() req: Request, @Body() dto: PreviewDto) {
    const userId = await this.userIdFromCookie(req);
    return this.bookmarksService.save(userId, dto.url, null);
  }

  @Get()
  async list(@Req() req: Request) {
    const userId = await this.userIdFromCookie(req);
    return this.bookmarksService.listForUser(userId);
  }
}
