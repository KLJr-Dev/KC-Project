import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { FileEntity } from '../files/entities/file.entity';
import { SharingEntity } from '../sharing/entities/sharing.entity';
import { GetAdminUsersResponseDto, UserListItemDto } from './dto/get-admin-users-response.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { AdminStatsResponseDto } from './dto/admin-stats-response.dto';
import { resolvePagination } from '../common/pagination.util';
import { logAdminEvent } from '../common/logging.util';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';
import {
  canAssignRole,
  canEscalateUserToModerator,
  roleRank,
} from '../auth/roles';

/**
 * AdminService — Administrative Business Logic.
 *
 * M5 security measures:
 * - CWE-841: ROLE_RANK via auth/roles.ts — role mutations check actor rank
 *   from the DB (not JWT alone) before assign/escalate.
 * - CWE-269: Escalate is admin-capable only (actor must outrank moderator).
 * - Audit: role_change / escalate still recorded (M1+).
 *
 * Residual: sequential IDs, broad admin list (pagination exists), etc. — later milestones.
 */
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @InjectRepository(SharingEntity)
    private readonly sharingRepository: Repository<SharingEntity>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Get all users with their details
   * CWE-400: No pagination, no limit — full table dump
   * CWE-200: Exposes all user emails and roles
   */
  async getAllUsers(query: AdminUsersQueryDto = {}): Promise<GetAdminUsersResponseDto> {
    const { skip, take } = resolvePagination(query.skip, query.take);
    const where: Record<string, unknown> = {};
    if (query.role) {
      where.role = query.role;
    }
    if (query.search) {
      const pattern = `%${query.search}%`;
      const [users, total] = await this.usersRepository.findAndCount({
        select: ['id', 'email', 'username', 'role', 'createdAt', 'updatedAt'],
        where: [
          { ...(query.role ? { role: query.role } : {}), email: ILike(pattern) },
          { ...(query.role ? { role: query.role } : {}), username: ILike(pattern) },
        ],
        order: { createdAt: 'ASC' },
        skip,
        take,
      });
      const items = users.map((user) => this.mapUserToDto(user));
      return { items, users: items, total, count: total, skip, take };
    }

    const [users, total] = await this.usersRepository.findAndCount({
      select: ['id', 'email', 'username', 'role', 'createdAt', 'updatedAt'],
      where,
      order: { createdAt: 'ASC' },
      skip,
      take,
    });

    const items = users.map((user) => this.mapUserToDto(user));
    return {
      items,
      users: items,
      total,
      count: total,
      skip,
      take,
    };
  }

  /**
   * Update a user's role (admin path).
   * Loads actor from DB and enforces ROLE_RANK (actorRank >= newRoleRank).
   *
   * @throws NotFoundException if target or actor missing
   * @throws ForbiddenException if actor cannot assign newRole per ROLE_RANK
   */
  async updateUserRole(
    userId: string,
    newRole: 'user' | 'moderator' | 'admin',
    actorId: string,
  ): Promise<UserListItemDto> {
    const actor = await this.usersRepository.findOne({ where: { id: actorId } });
    if (!actor) {
      throw new ForbiddenException('Insufficient permissions');
    }
    if (!canAssignRole(actor.role, newRole)) {
      throw new ForbiddenException('Cannot assign a role above your rank');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    // Optional hardening: cannot change a peer/higher target unless you outrank them.
    if (roleRank(actor.role) < roleRank(user.role)) {
      throw new ForbiddenException('Cannot modify a user with a higher role');
    }

    user.role = newRole;
    await this.usersRepository.save(user);

    logAdminEvent('role_change', {
      actorId,
      targetUserId: userId,
      newRole,
      actorRank: roleRank(actor.role),
    });
    await this.auditService.record(actorId, 'role_change', userId, {
      newRole,
      email: user.email,
    });

    return this.mapUserToDto(user);
  }

  /**
   * Escalate user → moderator only when ROLE_RANK allows (admin outranks moderator).
   * Actor role is loaded from DB — JWT role argument is ignored for the decision.
   *
   * @throws ForbiddenException if actor cannot escalate per canEscalateUserToModerator
   * @throws NotFoundException if target missing
   */
  async escalateUserRole(
    userId: string,
    _currentUserRole: 'user' | 'moderator' | 'admin',
    actorId: string,
  ): Promise<UserListItemDto> {
    const actor = await this.usersRepository.findOne({ where: { id: actorId } });
    if (!actor) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    if (user.role === 'moderator') {
      // Idempotent: already at escalate target rank
      return this.mapUserToDto(user);
    }

    if (!canEscalateUserToModerator(actor.role, user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    user.role = 'moderator';
    await this.usersRepository.save(user);
    logAdminEvent('escalate', {
      actorId,
      targetUserId: userId,
      byRole: actor.role,
      actorRank: roleRank(actor.role),
    });
    await this.auditService.record(actorId, 'escalate', userId, { newRole: 'moderator' });

    return this.mapUserToDto(user);
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return this.auditService.findAll();
  }

  async getStats(from?: string, to?: string): Promise<AdminStatsResponseDto> {
    const userCount = await this.usersRepository.count();
    const fileCount = await this.fileRepository.count();
    const shareCount = await this.sharingRepository.count();

    const files = await this.fileRepository.find({ select: ['size', 'uploadedAt'] });
    let storageBytesEstimate = files.reduce((sum, f) => sum + (f.size ?? 0), 0);

    if (from || to) {
      const fromTs = from ? Date.parse(from) : 0;
      const toTs = to ? Date.parse(to) : Number.MAX_SAFE_INTEGER;
      storageBytesEstimate = files
        .filter((f) => {
          const ts = Date.parse(f.uploadedAt ?? '');
          return ts >= fromTs && ts <= toTs;
        })
        .reduce((sum, f) => sum + (f.size ?? 0), 0);
    }

    return { userCount, fileCount, shareCount, storageBytesEstimate };
  }

  /**
   * Delete a user (v0.4.5 — Missing Authorization Example)
   * CWE-862: Improper Access Control — Missing Authorization Check
   *
   * This method demonstrates CWE-862 by:
   * 1. No role validation (controller doesn't use @HasRole('admin'))
   * 2. No ownership check (user can delete any other user, not just themselves)
   * 3. No audit trail of deletion (silent removal, console log lost on restart)
   * 4. Cascading orphaned file records (FilesEntity left with deleted userId)
   *
   * Secure implementations would:
   * - Require @HasRole('admin') in controller
   * - Validate caller is not deleting themselves (or require explicit confirmation)
   * - Record deletion with timestamp and who deleted whom
   * - Cascade delete or soft-delete file records
   * - Return 403 if caller is not admin
   *
   * @param userId - User ID to delete
   * @throws NotFoundException if user not found
   */
  async deleteUser(userId: string, actorId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    // Delete the user immediately, no confirmation, no recoverability
    await this.usersRepository.remove(user);

    // CWE-532: No audit trail — log to console, lost on restart
    logAdminEvent('delete_user', { actorId, targetUserId: userId, email: user.email });
    await this.auditService.record(actorId, 'delete_user', userId, { email: user.email });
  }

  /**
   * Helper: Map User entity to DTO
   */
  private mapUserToDto(user: User): UserListItemDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
