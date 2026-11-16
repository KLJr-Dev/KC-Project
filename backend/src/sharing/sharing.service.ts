/**
 * SharingService — owner or DB-loaded admin may mutate (v2.10.0).
 * Caller role must come from DB (HasRoleGuard refresh), never trust JWT alone.
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
import { User } from '../users/entities/user.entity';

const DEFAULT_PUBLIC_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class SharingService {
  constructor(
    @InjectRepository(SharingEntity)
    private readonly shareRepo: Repository<SharingEntity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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

  /** Load actor role from DB — JWT role is non-authoritative. */
  private async assertCanMutate(entity: SharingEntity, callerId: string): Promise<void> {
    if (entity.ownerId === callerId) return;
    const actor = await this.userRepo.findOne({ where: { id: callerId } });
    if (actor?.role === 'admin') return;
    throw new ForbiddenException('Insufficient permissions');
  }

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
  ): Promise<SharingResponseDto | null> {
    const entity = await this.shareRepo.findOne({ where: { id } });
    if (!entity) return null;
    await this.assertCanMutate(entity, callerId);

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

  async delete(id: string, callerId: string): Promise<boolean> {
    const entity = await this.shareRepo.findOne({ where: { id } });
    if (!entity) return false;
    await this.assertCanMutate(entity, callerId);
    const result = await this.shareRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByPublicToken(token: string): Promise<{ fileId: string; expiresAt: string } | null> {
    const entity = await this.shareRepo.findOne({ where: { publicToken: token } });
    if (!entity || !entity.public) return null;
    if (this.isExpired(entity.expiresAt)) return null;
    return { fileId: entity.fileId, expiresAt: entity.expiresAt };
  }
}
