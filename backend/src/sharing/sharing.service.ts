import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SharingEntity } from './entities/sharing.entity';
import { SharingResponseDto } from './dto/sharing-response.dto';
import { CreateSharingDto } from './dto/create-sharing.dto';
import { UpdateSharingDto } from './dto/update-sharing.dto';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Sharing service. Data is now persisted in PostgreSQL via TypeORM.
 * No real public links or expiry logic — placeholder behaviour.
 * Real sharing (v0.3.4) comes later.
 *
 * All methods are async (return Promises) because repository operations
 * hit the database.
 */
@Injectable()
export class SharingService {
  constructor(
    @InjectRepository(SharingEntity)
    private readonly shareRepo: Repository<SharingEntity>,
  ) {}

  /** Map a SharingEntity to a SharingResponseDto. */
  private toResponse(entity: SharingEntity): SharingResponseDto {
    const dto = new SharingResponseDto();
    dto.id = entity.id;
    dto.fileId = entity.fileId;
    dto.public = entity.public;
    dto.createdAt = entity.createdAt;
    dto.expiresAt = entity.expiresAt;
    return dto;
  }

  /** POST /sharing — persist share record to database. */
  async create(dto: CreateSharingDto): Promise<SharingResponseDto> {
    const count = await this.shareRepo.count();
    const id = String(count + 1);
    const entity = this.shareRepo.create({
      id,
      fileId: dto.fileId ?? '',
      public: dto.public ?? false,
      createdAt: new Date().toISOString(),
      expiresAt: dto.expiresAt ?? '',
    });
    const saved = await this.shareRepo.save(entity);
    return this.toResponse(saved);
  }

  /** GET /sharing — return all share records. */
  async read(): Promise<SharingResponseDto[]> {
    const entities = await this.shareRepo.find();
    return entities.map((e) => this.toResponse(e));
  }

  /** GET /sharing/:id — return single share or null. */
  async getById(id: string): Promise<SharingResponseDto | null> {
    const entity = await this.shareRepo.findOne({ where: { id } });
    return entity ? this.toResponse(entity) : null;
  }

  /** PUT /sharing/:id — update share record, return DTO or null. */
  async update(id: string, dto: UpdateSharingDto): Promise<SharingResponseDto | null> {
    const entity = await this.shareRepo.findOne({ where: { id } });
    if (!entity) return null;
    if (dto.public !== undefined) entity.public = dto.public;
    if (dto.expiresAt !== undefined) entity.expiresAt = dto.expiresAt;
    const saved = await this.shareRepo.save(entity);
    return this.toResponse(saved);
  }

  /** DELETE /sharing/:id — remove record, return success boolean. */
  async delete(id: string): Promise<boolean> {
    const result = await this.shareRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
