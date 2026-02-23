import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { FileEntity } from './entities/file.entity';
import { FileResponseDto } from './dto/file-response.dto';
import { UploadFileDto } from './dto/upload-file.dto';

/**
 * v0.5.0 -- Real Multipart File Upload
 *
 * Files service. Real file I/O via Multer multipart uploads.
 * Files stored on local filesystem in ./uploads/ with client-supplied
 * filenames (no sanitisation). Metadata persisted to file_entity table
 * with full records for each file: filename, mimetype, storagePath, size,
 * description, approvalStatus, uploadedAt, ownerId.
 *
 * MULTIPART FLOW DETAILS (v0.5.0):
 * 1. upload() receives Express.Multer.File from FileInterceptor
 * 2. File already written to disk by Multer at file.path
 * 3. Service creates FileEntity with:
 *    - id: sequential count (vulnerable to enumeration)
 *    - filename: file.originalname (no sanitisation, CWE-22)
 *    - mimetype: file.mimetype (client-supplied, CWE-434)
 *    - storagePath: file.path (absolute FS path, CWE-200)
 *    - size: file.size (from Multer, no quota checks)
 *    - ownerId: user.sub (stored but never re-checked, CWE-639)
 *    - approvalStatus: 'pending' (v0.4.3 carryover, no enforcement v0.5.0)
 * 4. Entity saved to DB, returned as FileResponseDto
 * 5. storagePath exposed in response (CWE-200)
 *
 * VULN (v0.2.2 - CWE-639): ownerId stored but never verified on read/delete.
 *       Any authenticated user can access or delete any file (IDOR).
 *       CWE-639 | A01:2025, CWE-862 | A01:2025
 *
 * VULN (v0.5.0 - CWE-200): storagePath exposed in FileResponseDto,
 *       revealing server directory structure to any authenticated user.
 *       CWE-200 | A01:2025
 *
 * VULN (v0.5.0 - CWE-22): delete() removes file from disk using storagePath
 *       with no path canonicalisation. If storagePath contains "..",
 *       files outside uploads/ can be deleted.
 *       CWE-22 | A01:2025
 *
 * VULN (v0.5.0 - CWE-22): getFileMeta() returns storagePath for download
 *       endpoint to use. download() endpoint calls res.sendFile(storagePath)
 *       with no path validation (trusts DB value).
 *
 * VULN (v0.5.0 - CWE-434): mimetype from client header, stored and returned
 *       on download. Download endpoint sets Content-Type to this value.
 *
 * VULN (v0.5.0 - CWE-400): No upload size limits. Unbounded file I/O.
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

  /**
   * PUT /files/:id/approve -- Moderator or admin approves/rejects file (v0.4.3).
   * VULN (v0.4.3): No ownership check. Any moderator/admin can approve any file.
   *       Combined with CWE-639 (forged JWT role), unauthorized approval possible.
   *       CWE-862 (Missing Authorization) | A01:2025
   */
  async approveFile(
    id: string,
    status: 'pending' | 'approved' | 'rejected',
  ): Promise<FileResponseDto | null> {
    const entity = await this.fileRepo.findOne({ where: { id } });
    if (!entity) return null;

    entity.approvalStatus = status;
    const updated = await this.fileRepo.save(entity);
    return this.toResponse(updated);
  }
}
