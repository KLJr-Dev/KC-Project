/**
 * M5 / v2.0.0 — UsersService (persistence for accounts).
 *
 * Security measures:
 * - CWE-256: create() / update() hash passwords with bcrypt before write;
 *   responses never include password (toResponse strips it).
 * - CWE-330: Sequential string IDs remain an accepted residual
 *   (see Cycle-2 residuals / security-baseline).
 *
 * findEntityByEmail is auth-only (includes password hash for verifyPassword).
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginatedResponse, resolvePagination } from '../common/pagination.util';
import { hashPassword } from '../auth/password.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** Map a User entity to a UserResponseDto (strips password hash). */
  private toResponse(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.username = user.username;
    dto.role = user.role;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }

  /**
   * POST /users — create a new user with bcrypt-hashed password.
   * Uses insert() so duplicate PK from count+1 fails loudly.
   */
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const count = await this.userRepo.count();
    const id = String(count + 1);
    const passwordHash = await hashPassword(dto.password ?? '');
    const user = this.userRepo.create({
      id,
      email: dto.email ?? '',
      username: dto.username ?? '',
      password: passwordHash,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await this.userRepo.insert(user);
    return this.toResponse(user);
  }

  /** Find a user by email, return DTO (no password). Used by auth registration duplicate check. */
  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    return user ? this.toResponse(user) : null;
  }

  /** Find a user by email, return raw entity (includes password hash). Used by auth login. */
  async findEntityByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  /** GET /users — paginated user list. */
  async findAll(query: PaginationQueryDto = {}) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    const [users, total] = await this.userRepo.findAndCount({
      skip,
      take,
      order: { createdAt: 'ASC' },
    });
    return buildPaginatedResponse(
      users.map((u) => this.toResponse(u)),
      total,
      skip,
      take,
    );
  }

  /** GET /users/:id — return single user or null. */
  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    return user ? this.toResponse(user) : null;
  }

  /**
   * PUT /users/:id — update entity; re-hash password when provided.
   * Strength already enforced by UpdateUserDto when password is present.
   */
  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.username !== undefined) user.username = dto.username;
    if (dto.password !== undefined) {
      user.password = await hashPassword(dto.password);
    }
    user.updatedAt = new Date().toISOString();
    const saved = await this.userRepo.save(user);
    return this.toResponse(saved);
  }

  /** DELETE /users/:id — remove entity, return success boolean. */
  async delete(id: string): Promise<boolean> {
    const result = await this.userRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
