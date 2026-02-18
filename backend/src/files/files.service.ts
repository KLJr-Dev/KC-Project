import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { FileEntity } from './entities/file.entity';
import { FileResponseDto } from './dto/file-response.dto';
import { UploadFileDto } from './dto/upload-file.dto';

/**
 * v0.3.3 -- File Deletion (filesystem)
 *
 * Files service. Real file I/O via Multer multipart uploads.
 * Files stored on local filesystem in ./uploads/ with client-supplied
 * filenames (no sanitisation).
 *
 * VULN (v0.2.2): ownerId stored but never checked on read/delete.
 *       CWE-639 | A01:2025
 *
 * VULN (v0.3.0): storagePath exposed in API responses, revealing
 *       server directory structure. CWE-200 | A01:2025
 *
 * VULN (v0.3.3): delete() removes file from disk using storagePath
 *       with no validation. If storagePath points outside uploads/,
 *       that file gets deleted. CWE-22 | A01:2025
 */
@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
  ) {}

  private toResponse(entity: FileEntity): FileResponseDto {
    const dto = new FileResponseDto();
    dto.id = entity.id;
    dto.ownerId = entity.ownerId;
    dto.filename = entity.filename;
    dto.mimetype = entity.mimetype;
    dto.storagePath = entity.storagePath;
    dto.description = entity.description;
    dto.size = entity.size;
    dto.uploadedAt = entity.uploadedAt;
    return dto;
  }

  /** POST /files -- persist file metadata + Multer wrote the file to disk. */
  async upload(
    file: Express.Multer.File,
    dto: UploadFileDto,
    ownerId: string,
  ): Promise<FileResponseDto> {
    const count = await this.fileRepo.count();
    const id = String(count + 1);
    const entity = this.fileRepo.create({
      id,
      ownerId,
      filename: file.originalname,
      mimetype: file.mimetype,
      storagePath: file.path,
      size: file.size,
      description: dto.description,
      uploadedAt: new Date().toISOString(),
    });
    const saved = await this.fileRepo.save(entity);
    return this.toResponse(saved);
  }

  /** GET /files -- return all file records, unbounded. */
  async findAll(): Promise<FileResponseDto[]> {
    const entities = await this.fileRepo.find();
    return entities.map((e) => this.toResponse(e));
  }

  /** GET /files/:id -- return file metadata or null. */
  async getById(id: string): Promise<FileResponseDto | null> {
    const entity = await this.fileRepo.findOne({ where: { id } });
    return entity ? this.toResponse(entity) : null;
  }

  /** Get raw file metadata for download/streaming. */
  async getFileMeta(
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

  /** DELETE /files/:id -- remove file from disk and DB record. */
  async delete(id: string): Promise<boolean> {
    const entity = await this.fileRepo.findOne({ where: { id } });
    if (!entity) return false;

    if (entity.storagePath) {
      try {
        await unlink(entity.storagePath);
      } catch {
        // File may already be gone -- proceed with DB deletion
      }
    }

    const result = await this.fileRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
