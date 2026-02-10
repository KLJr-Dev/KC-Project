import { Injectable } from '@nestjs/common';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Users service. In-memory mock only; no persistence. All methods exist to
 * satisfy controller routes and return placeholder data. Behaviour is not
 * guaranteed; structure is.
 *
 * --- NestJS convention: Service = business logic & data access ---
 * Same as admin: controller delegates here. Later we'll swap this for DB-backed
 * user CRUD; controller stays unchanged. Services are singletons per module.
 */
@Injectable()
export class UsersService {
  /** v0.0.6 — in-memory stub; not persisted. Resets on process restart. */
  private mockUsers: UserResponseDto[] = [
    { id: '1', email: 'stub@example.com', username: 'stub-user', createdAt: '2025-01-01T00:00:00Z' },
  ];

  /** v0.0.6 — stub for POST /users/create. Appends to mock list; response omits password. */
  create(dto: CreateUserDto): UserResponseDto {
    const id = String(this.mockUsers.length + 1);
    const created: UserResponseDto = {
      id,
      email: dto.email,
      username: dto.username,
      createdAt: new Date().toISOString(),
    };
    this.mockUsers.push(created);
    return created;
  }

  /** v0.0.6 — stub for GET /users/read. Returns copy to avoid external mutation. */
  read(): UserResponseDto[] {
    return [...this.mockUsers];
  }

  /** v0.0.6 — stub for GET /users/get/:id. Null = not found; controller maps to 404. */
  getById(id: string): UserResponseDto | null {
    return this.mockUsers.find((u) => u.id === id) ?? null;
  }

  /** v0.0.6 — stub for PUT /users/update/:id. Mutates in place; null if id missing. */
  update(id: string, dto: UpdateUserDto): UserResponseDto | null {
    const user = this.mockUsers.find((u) => u.id === id);
    if (!user) return null;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.username !== undefined) user.username = dto.username;
    return user;
  }

  /** v0.0.6 — stub for DELETE /users/delete/:id. Returns true if removed, false if unknown id. */
  delete(id: string): boolean {
    const idx = this.mockUsers.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.mockUsers.splice(idx, 1);
    return true;
  }
}
