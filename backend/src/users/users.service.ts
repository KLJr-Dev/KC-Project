import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * v0.2.1 — Persisted Authentication
 *
 * Users service. Data is now persisted in PostgreSQL via TypeORM.
 * All methods are async (return Promises) because repository operations
 * hit the database.
 *
 * ID generation: Sequential string from `count + 1`. This can produce
 * duplicates after deletions — same intentional weakness from ADR-008,
 * now persisted permanently.
 * CWE-330 (Use of Insufficiently Random Values) | A02:2021
 *
 * VULN: Passwords stored as plaintext in the password column (CWE-256).
 * VULN: No unique constraint on email — duplicate check is application-level only.
 *
 * VULN (v0.2.1): Unhandled TypeORM QueryFailedError exceptions (e.g. duplicate
 *       PK from the count+1 ID strategy) crash the request with a generic 500.
 *       The raw error — including PG table name, constraint name, and the full
 *       INSERT SQL with parameters — is logged to stdout via TypeORM's
 *       `logging: true` (CWE-532). The 500 itself confirms to an attacker
 *       that a database-level constraint was violated.
 *       CWE-209 (Generation of Error Message Containing Sensitive Information) | A05:2021
 *       Remediation (v2.0.0): Global exception filter that catches
 *       QueryFailedError, logs a sanitised message, and returns a
 *       user-friendly error without database internals.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

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

  /**
   * POST /users — create a new user, persist to database.
   *
   * Uses insert() (pure INSERT) instead of save() (upsert) so that a
   * duplicate PK from the count+1 strategy actually fails with a raw
   * PostgreSQL error instead of silently overwriting an existing user.
   *
   * VULN (v0.2.1): The unhandled QueryFailedError from a duplicate PK
   *       collision leaks PG table name, constraint name, and SQL in the
   *       500 response body (CWE-209).
   */
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const count = await this.userRepo.count();
    const id = String(count + 1);
    const user = this.userRepo.create({
      id,
      email: dto.email ?? '',
      username: dto.username ?? '',
      password: dto.password ?? '',
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

  /** Find a user by email, return raw entity (includes password). Used by auth login. */
  async findEntityByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  /** GET /users — return all users as response DTOs. */
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepo.find();
    return users.map((u) => this.toResponse(u));
  }

  /** GET /users/:id — return single user or null. */
  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    return user ? this.toResponse(user) : null;
  }

  /** PUT /users/:id — update entity in place, return DTO or null. */
  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.username !== undefined) user.username = dto.username;
    if (dto.password !== undefined) user.password = dto.password;
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
