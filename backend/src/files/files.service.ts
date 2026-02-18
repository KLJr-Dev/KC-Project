import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import { FileResponseDto } from './dto/file-response.dto';
import { UploadFileDto } from './dto/upload-file.dto';

/**
 * v0.2.3 — Enumeration Surface
 *
 * Files service. Data is now persisted in PostgreSQL via TypeORM.
 * No real file I/O — metadata only. Real file handling comes in v0.3.x.
 *
 * All methods are async (return Promises) because repository operations
 * hit the database.
 *
 * VULN (v0.2.2): ownerId is stored at upload time but never checked on
 *       getById() or delete(). Any authenticated user can read or delete
 *       any file by guessing/knowing its sequential ID.
 *       CWE-639 (Authorization Bypass Through User-Controlled Key) | A01:2025
 *       Remediation (v2.0.0): WHERE owner_id = $1 on every query.
 *
 * VULN (v0.2.3): findAll() returns every file record to any authenticated
 *       user with no pagination, filtering, or ownership scoping. A single
 *       GET /files request dumps the entire table including all ownerIds.
 *       CWE-200 (Exposure of Sensitive Information) | A01:2025
 *       CWE-400 (Uncontrolled Resource Consumption) | A06:2025
 *       Remediation (v2.0.0): Paginated results, WHERE owner_id = $1.
 */
@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
  ) {}

  /** Map a FileEntity to a FileResponseDto. */
  private toResponse(entity: FileEntity): FileResponseDto {
    const dto = new FileResponseDto();
    dto.id = entity.id;
    dto.ownerId = entity.ownerId;
    dto.filename = entity.filename;
    dto.description = entity.description;
    dto.size = entity.size;
    dto.uploadedAt = entity.uploadedAt;
    return dto;
  }

  /** POST /files — persist file metadata to database. */
  async upload(dto: UploadFileDto, ownerId: string): Promise<FileResponseDto> {
    const count = await this.fileRepo.count();
    const id = String(count + 1);
    const entity = this.fileRepo.create({
      id,
      ownerId, // VULN: stored but never checked on read/delete (CWE-639)
      filename: dto.filename ?? 'stub-upload',
      size: 0,
      uploadedAt: new Date().toISOString(),
    });
    const saved = await this.fileRepo.save(entity);
    return this.toResponse(saved);
  }

  /** GET /files — return all file records, unbounded. */
  async findAll(): Promise<FileResponseDto[]> {
    const entities = await this.fileRepo.find();
    return entities.map((e) => this.toResponse(e));
  }

  /** GET /files/:id — return file metadata or null. */
  async getById(id: string): Promise<FileResponseDto | null> {
    const entity = await this.fileRepo.findOne({ where: { id } });
    return entity ? this.toResponse(entity) : null;
  }

  /** DELETE /files/:id — remove record, return success boolean. */
  async delete(id: string): Promise<boolean> {
    const result = await this.fileRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
