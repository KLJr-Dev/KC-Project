import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { basename } from 'path';
import { existsSync } from 'fs';
import { NoteEntity } from './entities/note.entity';
import { NoteResponseDto } from './dto/note-response.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesQueryDto } from './dto/notes-query.dto';
import { buildPaginatedResponse, resolvePagination } from '../common/pagination.util';
import { assertNoteAttachment } from './notes-upload';

/**
 * Notes service — Cycle-4 Blue (`v2.2.0`).
 *
 * Authz mirrors Files:
 * - list: owner-scoped unless admin/moderator
 * - get: owner or admin/moderator
 * - update: owner only
 * - delete: owner or admin (moderator cannot delete others)
 * - flag: enforced at controller via @HasRole(['admin','moderator'])
 *
 * Search: TypeORM ILike on title/body when `q` present — parameterized, not concat.
 * Attachments: optional; SVG/HTML rejected (notes-upload.ts / C4-F01b).
 */
@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly noteRepo: Repository<NoteEntity>,
  ) {}

  private toResponse(entity: NoteEntity): NoteResponseDto {
    const dto = new NoteResponseDto();
    dto.id = entity.id;
    dto.ownerId = entity.ownerId;
    dto.title = entity.title;
    dto.body = entity.body;
    dto.flagged = entity.flagged;
    dto.attachmentFilename = entity.attachmentFilename;
    dto.attachmentMimetype = entity.attachmentMimetype;
    dto.hasAttachment = Boolean(entity.attachmentStoragePath);
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  private assertCanRead(entity: NoteEntity, callerId: string, callerRole: string): void {
    if (entity.ownerId === callerId) return;
    if (callerRole === 'admin' || callerRole === 'moderator') return;
    throw new ForbiddenException('You do not have access to this note');
  }

  private assertCanUpdate(entity: NoteEntity, callerId: string): void {
    if (entity.ownerId === callerId) return;
    throw new ForbiddenException('You do not have access to this note');
  }

  private assertCanDelete(entity: NoteEntity, callerId: string, callerRole: string): void {
    if (entity.ownerId === callerId) return;
    if (callerRole === 'admin') return;
    throw new ForbiddenException('You do not have access to this note');
  }

  private applyAttachment(entity: NoteEntity, file: Express.Multer.File): void {
    const verified = assertNoteAttachment(file.path, file.mimetype);
    entity.attachmentFilename = basename(file.originalname || 'upload');
    entity.attachmentMimetype = verified.mimetype;
    entity.attachmentStoragePath = file.path;
  }

  private async unlinkAttachment(entity: NoteEntity): Promise<void> {
    if (!entity.attachmentStoragePath) return;
    try {
      await unlink(entity.attachmentStoragePath);
    } catch {
      /* missing file on disk is non-fatal for DB delete */
    }
  }

  async create(
    dto: CreateNoteDto,
    ownerId: string,
    file?: Express.Multer.File,
  ): Promise<NoteResponseDto> {
    const count = await this.noteRepo.count();
    const now = new Date().toISOString();
    const entity = this.noteRepo.create({
      id: String(count + 1),
      ownerId,
      title: dto.title,
      body: dto.body,
      flagged: false,
      createdAt: now,
      updatedAt: now,
    });
    if (file) {
      this.applyAttachment(entity, file);
    }
    const saved = await this.noteRepo.save(entity);
    return this.toResponse(saved);
  }

  async findAll(query: NotesQueryDto, callerId: string, callerRole: string) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    const qb = this.noteRepo.createQueryBuilder('note');

    if (callerRole !== 'admin' && callerRole !== 'moderator') {
      qb.andWhere('note.ownerId = :callerId', { callerId });
    }

    const q = query.q?.trim();
    if (q) {
      // Parameterized ILIKE — do not interpolate `q` into raw SQL strings.
      qb.andWhere('(note.title ILIKE :q OR note.body ILIKE :q)', { q: `%${q}%` });
    }

    qb.orderBy('note.updatedAt', 'DESC').skip(skip).take(take);

    const [entities, total] = await qb.getManyAndCount();
    return buildPaginatedResponse(
      entities.map((e) => this.toResponse(e)),
      total,
      skip,
      take,
    );
  }

  async getById(
    id: string,
    callerId: string,
    callerRole: string,
  ): Promise<NoteResponseDto | null> {
    const entity = await this.noteRepo.findOne({ where: { id } });
    if (!entity) return null;
    this.assertCanRead(entity, callerId, callerRole);
    return this.toResponse(entity);
  }

  async update(
    id: string,
    dto: UpdateNoteDto,
    callerId: string,
    file?: Express.Multer.File,
  ): Promise<NoteResponseDto | null> {
    const entity = await this.noteRepo.findOne({ where: { id } });
    if (!entity) return null;
    this.assertCanUpdate(entity, callerId);
    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.body !== undefined) entity.body = dto.body;
    if (file) {
      await this.unlinkAttachment(entity);
      this.applyAttachment(entity, file);
    }
    entity.updatedAt = new Date().toISOString();
    const saved = await this.noteRepo.save(entity);
    return this.toResponse(saved);
  }

  async delete(id: string, callerId: string, callerRole: string): Promise<boolean> {
    const entity = await this.noteRepo.findOne({ where: { id } });
    if (!entity) return false;
    this.assertCanDelete(entity, callerId, callerRole);
    await this.unlinkAttachment(entity);
    await this.noteRepo.remove(entity);
    return true;
  }

  async flag(
    id: string,
    flagged: boolean,
    _callerId: string,
  ): Promise<NoteResponseDto | null> {
    const entity = await this.noteRepo.findOne({ where: { id } });
    if (!entity) return null;
    // Role gate is @HasRole on controller; any note may be flagged.
    entity.flagged = flagged;
    entity.updatedAt = new Date().toISOString();
    const saved = await this.noteRepo.save(entity);
    return this.toResponse(saved);
  }

  /** Attachment meta for streaming — same read authz as getById. */
  async getAttachmentMeta(
    id: string,
    callerId: string,
    callerRole: string,
  ): Promise<{
    storagePath: string;
    filename: string;
    mimetype?: string;
  } | null> {
    const entity = await this.noteRepo.findOne({ where: { id } });
    if (!entity || !entity.attachmentStoragePath) return null;
    this.assertCanRead(entity, callerId, callerRole);
    if (!existsSync(entity.attachmentStoragePath)) return null;
    return {
      storagePath: entity.attachmentStoragePath,
      filename: entity.attachmentFilename || 'attachment',
      mimetype: entity.attachmentMimetype,
    };
  }
}
