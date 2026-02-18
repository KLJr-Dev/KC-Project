import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
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

/**
 * v0.3.4 -- Public File Sharing
 *
 * Sharing controller. Authenticated CRUD at /sharing, plus an
 * unauthenticated public download at /sharing/public/:token.
 *
 * VULN (v0.2.2): ownerId recorded but never checked. CWE-639 | A01:2025
 * VULN (v0.2.3): GET /sharing returns everything unbounded. CWE-200 | A01:2025
 *
 * VULN (v0.3.4): GET /sharing/public/:token requires no authentication.
 *       Anyone with a valid (predictable) token can download any shared file.
 *       CWE-285 (Improper Authorization) | A01:2025
 *       CWE-330 (tokens are sequential) | A01:2025
 *       CWE-613 (expiresAt not checked) | A07:2025
 *       Remediation (v2.0.0): Require crypto-random tokens, check expiry.
 */
@Controller('sharing')
export class SharingController {
  constructor(
    private readonly sharingService: SharingService,
    private readonly filesService: FilesService,
  ) {}

  /**
   * GET /sharing/public/:token -- unauthenticated file download.
   * VULN: no auth required (CWE-285), sequential tokens (CWE-330),
   * expiry not checked (CWE-613).
   *
   * IMPORTANT: This route must be declared before :id routes to avoid
   * "public" being captured as an id parameter.
   */
  @Get('public/:token')
  async publicDownload(@Param('token') token: string, @Res() res: Response) {
    const share = await this.sharingService.findByPublicToken(token);
    if (!share) throw new NotFoundException();

    const fileMeta = await this.filesService.getFileMeta(share.fileId);
    if (!fileMeta || !fileMeta.storagePath) throw new NotFoundException();
    if (!existsSync(fileMeta.storagePath)) throw new NotFoundException();

    res.set('Content-Type', fileMeta.mimetype || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${fileMeta.filename}"`);
    res.sendFile(fileMeta.storagePath);
  }

  /** POST /sharing -- create share record. ownerId from JWT. */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateSharingDto, @CurrentUser() user: JwtPayload) {
    return this.sharingService.create(dto, user.sub);
  }

  /** GET /sharing -- list all share records. */
  @Get()
  @UseGuards(JwtAuthGuard)
  async read() {
    return this.sharingService.read();
  }

  /** GET /sharing/:id -- single share or 404. */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string) {
    const share = await this.sharingService.getById(id);
    if (!share) throw new NotFoundException();
    return share;
  }

  /** PUT /sharing/:id -- update share or 404. */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateSharingDto) {
    const share = await this.sharingService.update(id, dto);
    if (!share) throw new NotFoundException();
    return share;
  }

  /** DELETE /sharing/:id -- remove share or 404. */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    const ok = await this.sharingService.delete(id);
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }
}
