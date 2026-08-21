import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { basename } from 'path';
import { FileEntity } from './entities/file.entity';
import { SharingEntity } from '../sharing/entities/sharing.entity';
import { FileResponseDto } from './dto/file-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginatedResponse, resolvePagination } from '../common/pagination.util';
import { AuditService } from '../admin/audit.service';
import { assertSafeUpload } from './upload-security';
import { UploadFileDto } from './dto/upload-file.dto';

/**
 * Files service (v2.0.0) — ownership enforced on read/download/delete;
 * list scoped to owner unless caller is admin or moderator.
 */
@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
    @InjectRepository(SharingEntity)
    private readonly shareRepo: Repository<SharingEntity>,
    private readonly auditService: AuditService,
  ) {}

  private toResponse(entity: FileEntity): FileResponseDto {
    const dto = new FileResponseDto();
    dto.id = entity.id;
    dto.ownerId = entity.ownerId;
    dto.filename = entity.filename;
    dto.mimetype = entity.mimetype;
    // storagePath intentionally omitted from API responses (CWE-200)
    dto.description = entity.description;
    dto.size = entity.size;
    dto.approvalStatus = entity.approvalStatus;
    dto.uploadedAt = entity.uploadedAt;
    return dto;
  }

  private assertCanRead(entity: FileEntity, callerId: string, callerRole: string): void {
    if (entity.ownerId === callerId) return;
    if (callerRole === 'admin' || callerRole === 'moderator') return;
    throw new ForbiddenException('You do not have access to this file');
  }

  private assertCanDelete(entity: FileEntity, callerId: string, callerRole: string): void {
    if (entity.ownerId === callerId) return;
    if (callerRole === 'admin') return;
    throw new ForbiddenException('You do not have access to this file');
  }

  async upload(
    file: Express.Multer.File,
    dto: UploadFileDto,
    ownerId: string,
  ): Promise<FileResponseDto> {
    const verified = assertSafeUpload(file.path, file.mimetype);

    const count = await this.fileRepo.count();
    const id = String(count + 1);
    const entity = this.fileRepo.create({
      id,
      ownerId,
      filename: basename(file.originalname || 'upload'),
      mimetype: verified.mimetype,
      storagePath: file.path,
      size: verified.size,
      description: dto.description,
      uploadedAt: new Date().toISOString(),
    });
    const saved = await this.fileRepo.save(entity);
    return this.toResponse(saved);
  }

  async findAll(
    query: PaginationQueryDto = {},
    callerId?: string,
    callerRole: string = 'user',
  ) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    const where =
      callerRole === 'admin' || callerRole === 'moderator' || !callerId
        ? undefined
        : { ownerId: callerId };
    const [entities, total] = await this.fileRepo.findAndCount({
      where,
      skip,
      take,
      order: { uploadedAt: 'DESC' },
    });
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
  ): Promise<FileResponseDto | null> {
    const entity = await this.fileRepo.findOne({ where: { id } });
    if (!entity) return null;
    this.assertCanRead(entity, callerId, callerRole);
    return this.toResponse(entity);
  }

  /** Authenticated download path — ownership enforced. */
  async getFileMeta(
    id: string,
    callerId: string,
    callerRole: string,
  ): Promise<{ storagePath?: string; filename: string; mimetype?: string } | null> {
    const entity = await this.fileRepo.findOne({ where: { id } });
    if (!entity) return null;
    this.assertCanRead(entity, callerId, callerRole);
    return {
      storagePath: entity.storagePath,
      filename: entity.filename,
      mimetype: entity.mimetype,
    };
  }

  /** Internal/public-share path — no ownership check (token gate is elsewhere). */
  async getFileMetaById(
    id: string,
  ): Promise<{ storagePath?: string; filename: string; mimetype?: string } | null> {
    const entity = await this.fileRepo.findOne({ where: { id } });
    if (!entity) return null;
    return {
      storagePath: entity.storagePath,
      filename: entity.filename,
      mimetype: entity.mimetype,
    };
  }

  async delete(id: string, callerId: string, callerRole: string): Promise<boolean> {
    const entity = await this.fileRepo.findOne({ where: { id } });
    if (!entity) return false;
    this.assertCanDelete(entity, callerId, callerRole);

    if (entity.storagePath) {
      try {
        await unlink(entity.storagePath);
      } catch {
        // File may already be gone -- proceed with DB deletion
      }
    }

    await this.shareRepo.delete({ fileId: id });
    const result = await this.fileRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async approveFile(
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    actorId: string,
  ): Promise<FileResponseDto | null> {
    const entity = await this.fileRepo.findOne({ where: { id } });
    if (!entity) return null;

    entity.approvalStatus = status;
    const updated = await this.fileRepo.save(entity);
    await this.auditService.record(actorId, 'file_approve', id, { status });
    return this.toResponse(updated);
  }
}
