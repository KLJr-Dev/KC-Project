import { Injectable } from '@nestjs/common';
import { FileResponseDto } from './dto/file-response.dto';
import { UploadFileDto } from './dto/upload-file.dto';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Files service. In-memory mock only; no filesystem, no real upload/download.
 * All methods return placeholder data. Real file handling (v0.3.x) comes later.
 *
 * --- NestJS convention: Service = business logic & data access ---
 * Controller delegates here. Later we'll add storage and stream handling;
 * controller stays thin. Services are singletons per module.
 */
@Injectable()
export class FilesService {
  /** v0.0.6 — in-memory stub; not persisted. Resets on process restart. */
  private mockFiles: FileResponseDto[] = [
    { id: '1', filename: 'stub-file.txt', size: 0, uploadedAt: '2025-01-01T00:00:00Z' },
  ];

  /** v0.0.6 — stub for POST /files/upload. Ignores actual file; returns mock metadata. */
  upload(dto: UploadFileDto): FileResponseDto {
    const id = String(this.mockFiles.length + 1);
    const created: FileResponseDto = {
      id,
      filename: dto.filename ?? 'stub-upload',
      size: 0,
      uploadedAt: new Date().toISOString(),
    };
    this.mockFiles.push(created);
    return created;
  }

  /** v0.0.6 — stub for GET /files/download/:id. Returns metadata only; no stream. Null = 404. */
  getById(id: string): FileResponseDto | null {
    return this.mockFiles.find((f) => f.id === id) ?? null;
  }

  /** v0.0.6 — stub for DELETE /files/delete/:id. Returns true if removed, false if unknown id. */
  delete(id: string): boolean {
    const idx = this.mockFiles.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    this.mockFiles.splice(idx, 1);
    return true;
  }
}
