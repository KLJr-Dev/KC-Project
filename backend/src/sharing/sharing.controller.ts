/**
 * M8 / v2.0.0 — Sharing API.
 *
 * Security measures:
 * - CWE-639: PUT/DELETE require owner or admin (caller from JWT + DB role via guard path).
 * - CWE-22: Public download uses assertPathInsideUploads before sendFile.
 * - Public token route still unauthenticated by design (unguessable token + expiry from M2).
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { SharingService } from './sharing.service';
import { FilesService } from '../files/files.service';
import { CreateSharingDto } from './dto/create-sharing.dto';
import { UpdateSharingDto } from './dto/update-sharing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { existsSync } from 'fs';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { assertPathInsideUploads } from '../files/storage-path.util';

@Controller('sharing')
export class SharingController {
  constructor(
    private readonly sharingService: SharingService,
    private readonly filesService: FilesService,
  ) {}

  /**
   * GET /sharing/public/:token — unauthenticated download (token + expiry gate).
   * Path containment under uploads/ before sendFile (CWE-22).
   */
  @Get('public/:token')
  async publicDownload(@Param('token') token: string, @Res() res: Response) {
    const share = await this.sharingService.findByPublicToken(token);
    if (!share) throw new NotFoundException();

    const fileMeta = await this.filesService.getFileMetaById(share.fileId);
    if (!fileMeta || !fileMeta.storagePath) throw new NotFoundException();

    const safePath = assertPathInsideUploads(fileMeta.storagePath);
    if (!existsSync(safePath)) throw new NotFoundException();

    res.set('Content-Type', fileMeta.mimetype || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${fileMeta.filename}"`);
    res.sendFile(safePath);
  }

  /** POST /sharing — create share; ownerId from JWT. */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateSharingDto, @CurrentUser() user: JwtPayload) {
    return this.sharingService.create(dto, user.sub);
  }

  /** GET /sharing — paginated share list. */
  @Get()
  @UseGuards(JwtAuthGuard)
  async read(@Query() query: PaginationQueryDto) {
    return this.sharingService.read(query);
  }

  /** GET /sharing/:id — single share or 404. */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string) {
    const share = await this.sharingService.getById(id);
    if (!share) throw new NotFoundException();
    return share;
  }

  /**
   * PUT /sharing/:id — owner or admin only (CWE-639).
   * Cross-user attempts → 403 (prefer over 404 existence oracle for mutate).
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSharingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const share = await this.sharingService.update(id, dto, user.sub, user.role || 'user');
    if (!share) throw new NotFoundException();
    return share;
  }

  /** DELETE /sharing/:id — owner or admin only (CWE-639). */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const ok = await this.sharingService.delete(id, user.sub, user.role || 'user');
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }
}
