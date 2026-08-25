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
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesQueryDto } from './dto/notes-query.dto';
import { FlagNoteDto } from './dto/flag-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HasRole, HasRoleGuard } from '../auth/guards/has-role.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

/**
 * Notes HTTP API — Cycle-4 SoftDev (`v1.2.0`).
 *
 * Class guards reload DB role via HasRoleGuard (same as Files).
 * Flag requires moderator|admin; delete-any is service-enforced for admin.
 * Attachment upload/download lands in P1c.
 */
@Controller('notes')
@UseGuards(JwtAuthGuard, HasRoleGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  /** POST /notes — create note owned by caller. */
  @Post()
  async create(@Body() dto: CreateNoteDto, @CurrentUser() user: JwtPayload) {
    return this.notesService.create(dto, user.sub);
  }

  /** GET /notes — paginated list; optional parameterized `q` search. */
  @Get()
  async findAll(@Query() query: NotesQueryDto, @CurrentUser() user: JwtPayload) {
    return this.notesService.findAll(query, user.sub, user.role || 'user');
  }

  /** GET /notes/:id — metadata + body (XSS sink is frontend render). */
  @Get(':id')
  async getById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const note = await this.notesService.getById(id, user.sub, user.role || 'user');
    if (!note) throw new NotFoundException();
    return note;
  }

  /** PUT /notes/:id — owner-only update. */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const note = await this.notesService.update(id, dto, user.sub);
    if (!note) throw new NotFoundException();
    return note;
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
