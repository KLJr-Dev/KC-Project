import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SharingEntity } from './entities/sharing.entity';
import { SharingResponseDto } from './dto/sharing-response.dto';
import { CreateSharingDto } from './dto/create-sharing.dto';
import { UpdateSharingDto } from './dto/update-sharing.dto';

/**
 * v0.3.4 -- Public File Sharing
 *
 * Sharing service. Persists share records in PostgreSQL via TypeORM.
 * When a share is created with public=true, a predictable publicToken
 * ("share-1", "share-2") is generated.
 *
 * VULN (v0.2.2): ownerId stored but never checked on read/update/delete.
 *       CWE-639 | A01:2025
 *
 * VULN (v0.3.4): publicToken is sequential and trivially guessable.
 *       CWE-330 (Use of Insufficiently Random Values) | A01:2025
 *       Remediation (v2.0.0): crypto.randomBytes(32).toString('hex').
 *
 * VULN (v0.3.4): expiresAt is stored but never enforced on access.
 *       CWE-613 (Insufficient Session Expiration) | A07:2025
 */
@Injectable()
export class SharingService {
  constructor(
    @InjectRepository(SharingEntity)
    private readonly shareRepo: Repository<SharingEntity>,
  ) {}

  private toResponse(entity: SharingEntity): SharingResponseDto {
    const dto = new SharingResponseDto();
    dto.id = entity.id;
    dto.ownerId = entity.ownerId;
    dto.fileId = entity.fileId;
    dto.publicToken = entity.publicToken;
    dto.public = entity.public;
    dto.createdAt = entity.createdAt;
    dto.expiresAt = entity.expiresAt;
    return dto;
  }

  /** POST /sharing -- persist share record. Generates predictable publicToken if public=true. */
  async create(dto: CreateSharingDto, ownerId: string): Promise<SharingResponseDto> {
    const count = await this.shareRepo.count();
    const id = String(count + 1);

    const entity = this.shareRepo.create({
      id,
      ownerId,
      fileId: dto.fileId ?? '',
      public: dto.public ?? false,
      publicToken: dto.public ? `share-${id}` : undefined,
      createdAt: new Date().toISOString(),
      expiresAt: dto.expiresAt ?? '',
    });
    const saved = await this.shareRepo.save(entity);
    return this.toResponse(saved);
  }

  /** GET /sharing -- return all share records. */
  async read(): Promise<SharingResponseDto[]> {
    const entities = await this.shareRepo.find();
    return entities.map((e) => this.toResponse(e));
  }

  /** GET /sharing/:id -- return single share or null. */
  async getById(id: string): Promise<SharingResponseDto | null> {
    const entity = await this.shareRepo.findOne({ where: { id } });
    return entity ? this.toResponse(entity) : null;
  }

  /** PUT /sharing/:id -- update share record, return DTO or null. */
  async update(id: string, dto: UpdateSharingDto): Promise<SharingResponseDto | null> {
    const entity = await this.shareRepo.findOne({ where: { id } });
    if (!entity) return null;
    if (dto.public !== undefined) entity.public = dto.public;
    if (dto.expiresAt !== undefined) entity.expiresAt = dto.expiresAt;
    const saved = await this.shareRepo.save(entity);
    return this.toResponse(saved);
  }

  /** DELETE /sharing/:id -- remove record, return success boolean. */
  async delete(id: string): Promise<boolean> {
    const result = await this.shareRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /** Look up a sharing record by its publicToken. Returns raw entity for download. */
  async findByPublicToken(
    token: string,
  ): Promise<{ fileId: string; expiresAt: string } | null> {
    const entity = await this.shareRepo.findOne({ where: { publicToken: token } });
    if (!entity) return null;
    return { fileId: entity.fileId, expiresAt: entity.expiresAt };
  }
}
