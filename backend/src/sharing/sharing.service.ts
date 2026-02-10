import { Injectable } from '@nestjs/common';
import { SharingResponseDto } from './dto/sharing-response.dto';
import { CreateSharingDto } from './dto/create-sharing.dto';
import { UpdateSharingDto } from './dto/update-sharing.dto';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Sharing service. In-memory mock only; no persistence. All methods exist to
 * satisfy controller routes and return placeholder data. Real public links
 * and expiry (v0.3.4) come later.
 *
 * --- NestJS convention: Service = business logic & data access ---
 * Same as admin/users: controller delegates here. Later we'll add DB-backed
 * share records; controller stays unchanged.
 */
@Injectable()
export class SharingService {
  /** v0.0.6 — in-memory stub; not persisted. Resets on process restart. */
  private mockShares: SharingResponseDto[] = [
    {
      id: '1',
      fileId: '1',
      public: true,
      createdAt: '2025-01-01T00:00:00Z',
      expiresAt: undefined,
    },
  ];

  /** v0.0.6 — stub for POST /sharing/create. Appends to mock list. */
  create(dto: CreateSharingDto): SharingResponseDto {
    const id = String(this.mockShares.length + 1);
    const created: SharingResponseDto = {
      id,
      fileId: dto.fileId,
      public: dto.public,
      createdAt: new Date().toISOString(),
      expiresAt: dto.expiresAt,
    };
    this.mockShares.push(created);
    return created;
  }

  /** v0.0.6 — stub for GET /sharing/read. Returns copy to avoid external mutation. */
  read(): SharingResponseDto[] {
    return [...this.mockShares];
  }

  /** v0.0.6 — stub for GET /sharing/get/:id. Null = not found; controller maps to 404. */
  getById(id: string): SharingResponseDto | null {
    return this.mockShares.find((s) => s.id === id) ?? null;
  }

  /** v0.0.6 — stub for PUT /sharing/update/:id. Mutates in place; null if id missing. */
  update(id: string, dto: UpdateSharingDto): SharingResponseDto | null {
    const share = this.mockShares.find((s) => s.id === id);
    if (!share) return null;
    if (dto.public !== undefined) share.public = dto.public;
    if (dto.expiresAt !== undefined) share.expiresAt = dto.expiresAt;
    return share;
  }

  /** v0.0.6 — stub for DELETE /sharing/delete/:id. Returns true if removed, false if unknown id. */
  delete(id: string): boolean {
    const idx = this.mockShares.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.mockShares.splice(idx, 1);
    return true;
  }
}
