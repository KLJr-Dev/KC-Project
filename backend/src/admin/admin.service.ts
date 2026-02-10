import { Injectable } from '@nestjs/common';
import { AdminResponseDto } from './dto/admin-response.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Admin service. In-memory mock only; no persistence. All methods exist to
 * satisfy controller routes and return placeholder data. Behaviour is not
 * guaranteed; structure is.
 *
 * --- NestJS convention: Service = business logic & data access ---
 * @Injectable() marks this class as a "provider": Nest can instantiate it and
 * inject it into controllers (or other services). The controller never touches
 * data directly — it calls this service. Later we can swap this stub for a
 * real implementation (DB, etc.) without changing the controller. Services are
 * singletons per module: one instance shared by all consumers.
 *
 * --- Why keep logic here, not in the controller? ---
 * So we can unit-test business rules without HTTP. So multiple controllers or
 * background jobs can reuse the same logic. So the HTTP layer stays thin and
 * only deals with request/response shape.
 */
@Injectable()
export class AdminService {
  /** v0.0.6 — in-memory stub; not persisted. Resets on process restart. */
  private mockItems: AdminResponseDto[] = [
    { id: '1', label: 'admin-stub-1', role: 'admin', createdAt: '2025-01-01T00:00:00Z' },
  ];

  /** v0.0.6 — stub for POST /admin/create. Appends to mock list, returns created shape. */
  create(_dto: CreateAdminDto): AdminResponseDto {
    const id = String(this.mockItems.length + 1);
    const created: AdminResponseDto = {
      id,
      label: _dto.label,
      role: _dto.role,
      createdAt: new Date().toISOString(),
    };
    this.mockItems.push(created);
    return created;
  }

  /** v0.0.6 — stub for GET /admin/read. Returns copy to avoid external mutation. */
  read(): AdminResponseDto[] {
    return [...this.mockItems];
  }

  /** v0.0.6 — stub for GET /admin/get/:id. Null = not found; controller maps to 404. */
  getById(id: string): AdminResponseDto | null {
    return this.mockItems.find((item) => item.id === id) ?? null;
  }

  /** v0.0.6 — stub for PUT /admin/update/:id. Mutates in place; null if id missing. */
  update(id: string, dto: UpdateAdminDto): AdminResponseDto | null {
    const item = this.mockItems.find((i) => i.id === id);
    if (!item) return null;
    if (dto.label !== undefined) item.label = dto.label;
    if (dto.role !== undefined) item.role = dto.role;
    return item;
  }

  /** v0.0.6 — stub for DELETE /admin/delete/:id. Returns true if removed, false if unknown id. */
  delete(id: string): boolean {
    const idx = this.mockItems.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    this.mockItems.splice(idx, 1);
    return true;
  }
}
