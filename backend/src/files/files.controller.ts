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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { ApproveFileDto } from './dto/approve-file.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HasRole, HasRoleGuard } from '../auth/guards/has-role.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { assertPathInsideUploads } from './storage-path.util';
import {
  sanitizeUploadFilename,
  UPLOAD_FILE_SIZE_LIMIT,
} from './upload-security';

/**
 * Files upload/download/approve (secure parallel v2.1.0).
 *
 * Historical (v1.0.0): client filename → disk, no size limit, IDOR, storagePath
 * leakage, JWT-trusted approve — see Cycle-1 writeup.
 * Current: sanitizeUploadFilename, Multer limits, ownership checks,
 * assertPathInsideUploads, HasRoleGuard (DB role), no storagePath in API DTO.
 */
@Controller('files')
@UseGuards(JwtAuthGuard, HasRoleGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * POST /files — multipart upload with sanitized disk name + size limit.
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: UPLOAD_FILE_SIZE_LIMIT },
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          try {
            cb(null, sanitizeUploadFilename(file.originalname));
          } catch (err) {
            cb(err as Error, '');
          }
        },
      }),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      return await this.filesService.upload(file, dto, user.sub);
    } catch (err) {
      if (file?.path && existsSync(file.path)) {
        unlinkSync(file.path);
      }
      throw err;
    }
  }

  /** GET /files -- paginated file list (scoped by role). */
  @Get()
  async findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: JwtPayload) {
    return this.filesService.findAll(query, user.sub, user.role || 'user');
  }

  /** GET /files/:id -- return file metadata or 404. */
  @Get(':id')
  async getById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const file = await this.filesService.getById(id, user.sub, user.role || 'user');
    if (!file) throw new NotFoundException();
    return file;
  }

  /**
   * GET /files/:id/download — stream file from disk.
   * Ownership enforced (service) + path containment under uploads/ (CWE-22).
   */
  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const meta = await this.filesService.getFileMeta(id, user.sub, user.role || 'user');
    if (!meta || !meta.storagePath) throw new NotFoundException();

    const safePath = assertPathInsideUploads(meta.storagePath);
    if (!existsSync(safePath)) throw new NotFoundException();

    res.set('Content-Type', meta.mimetype || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${meta.filename}"`);
    res.sendFile(safePath);
  }

  /**
   * DELETE /files/:id -- remove file record AND file from disk (owner or admin).
   */
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const ok = await this.filesService.delete(id, user.sub, user.role || 'user');
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }

  /**
   * PUT /files/:id/approve — moderator or admin (DB role via HasRoleGuard).
   */
  @Put(':id/approve')
  @HasRole(['admin', 'moderator'])
  async approveFile(
    @Param('id') id: string,
    @Body() dto: ApproveFileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const updated = await this.filesService.approveFile(id, dto.status, user.sub);
    if (!updated) throw new NotFoundException();
    return updated;
  }
}
