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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { existsSync, unlinkSync } from 'fs';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesQueryDto } from './dto/notes-query.dto';
import { FlagNoteDto } from './dto/flag-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HasRole, HasRoleGuard } from '../auth/guards/has-role.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { assertPathInsideUploads } from '../files/storage-path.util';
import {
  NOTE_ATTACHMENT_SIZE_LIMIT,
  notesUploadsDir,
  sanitizeNoteAttachmentFilename,
} from './notes-upload';

/**
 * Notes HTTP API — Cycle-4 Blue (`v2.2.0`).
 *
 * Class guards reload DB role via HasRoleGuard (same as Files).
 * Flag requires moderator|admin; delete-any is service-enforced for admin.
 *
 * Attachments (C4-F01b): optional multipart `attachment`; SVG/HTML rejected;
 * always Content-Disposition: attachment (never inline).
 */
@Controller('notes')
@UseGuards(JwtAuthGuard, HasRoleGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  /** POST /notes — JSON or multipart (+ optional attachment). */
  @Post()
  @UseInterceptors(
    FileInterceptor('attachment', {
      limits: { fileSize: NOTE_ATTACHMENT_SIZE_LIMIT },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          try {
            cb(null, notesUploadsDir());
          } catch (err) {
            cb(err as Error, '');
          }
        },
        filename: (_req, file, cb) => {
          try {
            cb(null, sanitizeNoteAttachmentFilename(file.originalname));
          } catch (err) {
            cb(err as Error, '');
          }
        },
      }),
    }),
  )
  async create(
    @Body() dto: CreateNoteDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      return await this.notesService.create(dto, user.sub, file);
    } catch (err) {
      if (file?.path && existsSync(file.path)) {
        unlinkSync(file.path);
      }
      throw err;
    }
  }

  /** GET /notes — paginated list; optional parameterized `q` search. */
  @Get()
  async findAll(@Query() query: NotesQueryDto, @CurrentUser() user: JwtPayload) {
    return this.notesService.findAll(query, user.sub, user.role || 'user');
  }

  /**
   * GET /notes/:id/attachment — stream file as download only (C4-F01b).
   * Registered before GET :id so Nest matches the static suffix.
   */
  @Get(':id/attachment')
  async downloadAttachment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const meta = await this.notesService.getAttachmentMeta(
      id,
      user.sub,
      user.role || 'user',
    );
    if (!meta) throw new NotFoundException();

    const safePath = assertPathInsideUploads(meta.storagePath);
    if (!existsSync(safePath)) throw new NotFoundException();

    const mime = meta.mimetype || 'application/octet-stream';
    res.set('Content-Type', mime);
    // Never inline — browser must not execute SVG/HTML as a document
    res.set('Content-Disposition', `attachment; filename="${meta.filename}"`);
    res.sendFile(safePath);
  }

  /** GET /notes/:id — metadata + body (body rendered escaped on the client). */
  @Get(':id')
  async getById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const note = await this.notesService.getById(id, user.sub, user.role || 'user');
    if (!note) throw new NotFoundException();
    return note;
  }

  /** PUT /notes/:id — owner-only update; optional replacement attachment. */
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('attachment', {
      limits: { fileSize: NOTE_ATTACHMENT_SIZE_LIMIT },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          try {
            cb(null, notesUploadsDir());
          } catch (err) {
            cb(err as Error, '');
          }
        },
        filename: (_req, file, cb) => {
          try {
            cb(null, sanitizeNoteAttachmentFilename(file.originalname));
          } catch (err) {
            cb(err as Error, '');
          }
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const note = await this.notesService.update(id, dto, user.sub, file);
      if (!note) throw new NotFoundException();
      return note;
    } catch (err) {
      if (file?.path && existsSync(file.path)) {
        unlinkSync(file.path);
      }
      throw err;
    }
  }

  /** DELETE /notes/:id — owner or admin. */
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const ok = await this.notesService.delete(id, user.sub, user.role || 'user');
    if (!ok) throw new NotFoundException();
    return { deleted: true };
  }

  /**
   * PUT /notes/:id/flag — mark/unmark for review (moderator/admin).
   * DB role enforced by HasRoleGuard + @HasRole metadata.
   */
  @Put(':id/flag')
  @HasRole(['admin', 'moderator'])
  async flag(
    @Param('id') id: string,
    @Body() dto: FlagNoteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const note = await this.notesService.flag(id, dto.flagged, user.sub);
    if (!note) throw new NotFoundException();
    return note;
  }
}
