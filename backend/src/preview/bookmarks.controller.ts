import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { REFRESH_COOKIE_NAME } from '../auth/cookie.util';
import { assertCsrfHeader } from '../auth/csrf.util';
import { BookmarksService } from './bookmarks.service';
import { PreviewDto } from './dto/preview.dto';

/**
 * Cookie-auth bookmarks under `/auth/bookmarks` (Cycle-6 Blue / v2.3.0).
 * CSRF required on mutations (parity with refresh). GET /save removed.
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

  @Post()
  async savePost(@Req() req: Request, @Body() dto: PreviewDto) {
    assertCsrfHeader(req);
    if (!dto?.url || typeof dto.url !== 'string') {
      throw new BadRequestException('url required');
    }
    const userId = await this.userIdFromCookie(req);
    return this.bookmarksService.save(userId, dto.url, null);
  }

  @Get()
  async list(@Req() req: Request) {
    const userId = await this.userIdFromCookie(req);
    return this.bookmarksService.listForUser(userId);
  }
}
