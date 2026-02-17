import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminItem } from './entities/admin-item.entity';
import { AdminResponseDto } from './dto/admin-response.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Admin service. Data is now persisted in PostgreSQL via TypeORM.
 * Placeholder admin records — real admin behaviour (roles, user management)
 * comes in v0.4.x.
 *
 * All methods are async (return Promises) because repository operations
 * hit the database.
 */
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminItem)
    private readonly adminRepo: Repository<AdminItem>,
  ) {}

  /** Map an AdminItem entity to an AdminResponseDto. */
  private toResponse(entity: AdminItem): AdminResponseDto {
    const dto = new AdminResponseDto();
    dto.id = entity.id;
    dto.label = entity.label;
    dto.role = entity.role;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  /** POST /admin — persist admin item to database. */
  async create(dto: CreateAdminDto): Promise<AdminResponseDto> {
    const count = await this.adminRepo.count();
    const id = String(count + 1);
    const entity = this.adminRepo.create({
      id,
      label: dto.label ?? '',
      role: dto.role ?? '',
      createdAt: new Date().toISOString(),
    });
    const saved = await this.adminRepo.save(entity);
    return this.toResponse(saved);
  }

  /** GET /admin — return all admin items. */
  async read(): Promise<AdminResponseDto[]> {
    const entities = await this.adminRepo.find();
    return entities.map((e) => this.toResponse(e));
  }

  /** GET /admin/:id — return single admin item or null. */
  async getById(id: string): Promise<AdminResponseDto | null> {
    const entity = await this.adminRepo.findOne({ where: { id } });
    return entity ? this.toResponse(entity) : null;
  }

  /** PUT /admin/:id — update admin item, return DTO or null. */
  async update(id: string, dto: UpdateAdminDto): Promise<AdminResponseDto | null> {
    const entity = await this.adminRepo.findOne({ where: { id } });
    if (!entity) return null;
    if (dto.label !== undefined) entity.label = dto.label;
    if (dto.role !== undefined) entity.role = dto.role;
    const saved = await this.adminRepo.save(entity);
    return this.toResponse(saved);
  }

  /** DELETE /admin/:id — remove record, return success boolean. */
  async delete(id: string): Promise<boolean> {
    const result = await this.adminRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
