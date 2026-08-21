/**
 * M8 / v2.0.0 — SharingService.
 *
 * Security measures:
 * - CWE-639: update/delete assert caller is share owner or admin.
 * - CWE-330 residual: sequential share IDs remain (documented accepted residual).
 * - Public tokens: crypto-random + expiry (M2).
 */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { SharingEntity } from './entities/sharing.entity';
import { SharingResponseDto } from './dto/sharing-response.dto';
import { CreateSharingDto } from './dto/create-sharing.dto';
import { UpdateSharingDto } from './dto/update-sharing.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginatedResponse, resolvePagination } from '../common/pagination.util';

const DEFAULT_PUBLIC_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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

  private newPublicToken(): string {
    return randomBytes(32).toString('hex');
  }

  private defaultExpiresAt(): string {
    return new Date(Date.now() + DEFAULT_PUBLIC_TTL_MS).toISOString();
  }

  private isExpired(expiresAt: string | undefined | null): boolean {
    if (!expiresAt || expiresAt.trim() === '') return false;
    const exp = Date.parse(expiresAt);
    return !Number.isNaN(exp) && exp < Date.now();
  }

  /** Owner or admin may mutate; others get 403. */
  private assertCanMutate(
    entity: SharingEntity,
    callerId: string,
    callerRole: string,
  ): void {
    if (entity.ownerId === callerId || callerRole === 'admin') {
      return;
    }
    throw new ForbiddenException('Insufficient permissions');
  }

  /** POST /sharing — persist share; public tokens are crypto-random. */
  async create(dto: CreateSharingDto, ownerId: string): Promise<SharingResponseDto> {
    const count = await this.shareRepo.count();
    const id = String(count + 1);
    const isPublic = dto.public ?? false;

    const entity = this.shareRepo.create({
      id,
      ownerId,
      fileId: dto.fileId ?? '',
      public: isPublic,
      publicToken: isPublic ? this.newPublicToken() : undefined,
      createdAt: new Date().toISOString(),
      expiresAt: dto.expiresAt ?? (isPublic ? this.defaultExpiresAt() : ''),
    });
    const saved = await this.shareRepo.save(entity);
    return this.toResponse(saved);
  }

  async read(query: PaginationQueryDto = {}) {
    const { skip, take } = resolvePagination(query.skip, query.take);
    const [entities, total] = await this.shareRepo.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
    return buildPaginatedResponse(
      entities.map((e) => this.toResponse(e)),
      total,
      skip,
      take,
    );
  }

  async getById(id: string): Promise<SharingResponseDto | null> {
    const entity = await this.shareRepo.findOne({ where: { id } });
    return entity ? this.toResponse(entity) : null;
  }

  async update(
    id: string,
    dto: UpdateSharingDto,
    callerId: string,
    callerRole: string,
  ): Promise<SharingResponseDto | null> {
    const entity = await this.shareRepo.findOne({ where: { id } });
    if (!entity) return null;
    this.assertCanMutate(entity, callerId, callerRole);

    if (dto.public !== undefined) {
      entity.public = dto.public;
      if (dto.public && !entity.publicToken) {
        entity.publicToken = this.newPublicToken();
        if (!entity.expiresAt) {
          entity.expiresAt = this.defaultExpiresAt();
        }
      } else if (!dto.public) {
        entity.publicToken = undefined;
      }
    }
    if (dto.expiresAt !== undefined) entity.expiresAt = dto.expiresAt;
    const saved = await this.shareRepo.save(entity);
    return this.toResponse(saved);
  }

  async delete(id: string, callerId: string, callerRole: string): Promise<boolean> {
    const entity = await this.shareRepo.findOne({ where: { id } });
    if (!entity) return false;
    this.assertCanMutate(entity, callerId, callerRole);
    const result = await this.shareRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /** Look up by publicToken; expired shares are treated as missing. */
  async findByPublicToken(token: string): Promise<{ fileId: string; expiresAt: string } | null> {
    const entity = await this.shareRepo.findOne({ where: { publicToken: token } });
    if (!entity || !entity.public) return null;
    if (this.isExpired(entity.expiresAt)) return null;
    return { fileId: entity.fileId, expiresAt: entity.expiresAt };
  }
}
