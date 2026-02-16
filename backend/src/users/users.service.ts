import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * v0.1.0 — User Model Introduced
 *
 * Users service. Internal store is now User entities (with password),
 * not response DTOs. The service maps entities to UserResponseDto at
 * the boundary — password never leaves this layer.
 *
 * Still in-memory, no persistence. Resets on process restart.
 */
@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: '1',
      email: 'stub@example.com',
      username: 'stub-user',
      password: 'password123',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  /** Map a User entity to a UserResponseDto (strips password). */
  private toResponse(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.username = user.username;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }

  /** POST /users — create a new user from DTO, store as entity. */
  create(dto: CreateUserDto): UserResponseDto {
    const id = String(this.users.length + 1);
    const user: User = {
      id,
      email: dto.email ?? '',
      username: dto.username ?? '',
      password: dto.password ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(user);
    return this.toResponse(user);
  }

  /** Find a user entity by email or return null. Used by auth registration. */
  findByEmail(email: string): UserResponseDto | null {
    const user = this.users.find((u) => u.email === email);
    return user ? this.toResponse(user) : null;
  }

  /** GET /users — return all users as response DTOs. */
  findAll(): UserResponseDto[] {
    return this.users.map((u) => this.toResponse(u));
  }

  /** GET /users/:id — return single user or null. */
  findById(id: string): UserResponseDto | null {
    const user = this.users.find((u) => u.id === id);
    return user ? this.toResponse(user) : null;
  }

  /** PUT /users/:id — update entity in place, return DTO or null. */
  update(id: string, dto: UpdateUserDto): UserResponseDto | null {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.username !== undefined) user.username = dto.username;
    if (dto.password !== undefined) user.password = dto.password;
    user.updatedAt = new Date().toISOString();
    return this.toResponse(user);
  }

  /** DELETE /users/:id — remove entity, return success boolean. */
  delete(id: string): boolean {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
  }
}
