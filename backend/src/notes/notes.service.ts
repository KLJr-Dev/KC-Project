import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteEntity } from './entities/note.entity';
import { NoteResponseDto } from './dto/note-response.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesQueryDto } from './dto/notes-query.dto';
import { buildPaginatedResponse, resolvePagination } from '../common/pagination.util';

/**
 * Notes service — Cycle-4 SoftDev (`v1.2.0`).
 *
 * Authz mirrors Files:
 * - list: owner-scoped unless admin/moderator
 * - get: owner or admin/moderator
 * - update: owner only
 * - delete: owner or admin (moderator cannot delete others)
 * - flag: enforced at controller via @HasRole(['admin','moderator'])
 *
 * Search: TypeORM ILike on title/body when `q` present — parameterized, not concat.
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

  async create(dto: CreateNoteDto, ownerId: string): Promise<NoteResponseDto> {
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
  ): Promise<NoteResponseDto | null> {
    const entity = await this.noteRepo.findOne({ where: { id } });
    if (!entity) return null;
    this.assertCanUpdate(entity, callerId);
    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.body !== undefined) entity.body = dto.body;
    entity.updatedAt = new Date().toISOString();
    const saved = await this.noteRepo.save(entity);
    return this.toResponse(saved);
  }

  async delete(id: string, callerId: string, callerRole: string): Promise<boolean> {
    const entity = await this.noteRepo.findOne({ where: { id } });
    if (!entity) return false;
    this.assertCanDelete(entity, callerId, callerRole);
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
}
