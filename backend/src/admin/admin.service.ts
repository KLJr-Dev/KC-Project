import { Injectable, NotFoundException } from '@nestjs/common';
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

/**
 * AdminService — Administrative Business Logic (v0.4.1: User Management)
 *
 * CWE-400: getAllUsers() returns all users without pagination or limits.
 * CWE-200: User emails and roles are exposed to any authenticated admin.
 * CWE-862: No audit trail or confirmation mechanism on role changes.
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
   * Update a user's role
   * CWE-862: No additional authorization checks beyond "is admin"
   * CWE-639: Role change is permanent immediately; no confirmation or audit
   * @throws NotFoundException if user not found
   */
  async updateUserRole(
    userId: string,
    newRole: 'user' | 'moderator' | 'admin',
    actorId: string,
  ): Promise<UserListItemDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    user.role = newRole;
    await this.usersRepository.save(user);

    // CWE-532: No audit of role changes — no persistent log of who changed what, when
    logAdminEvent('role_change', { actorId, targetUserId: userId, newRole });
    await this.auditService.record(actorId, 'role_change', userId, {
      newRole,
      email: user.email,
    });

    return this.mapUserToDto(user);
  }

  /**
   * Escalate a user's role (moderator can promote user → moderator)
   * CWE-269: Improper Access Control via Role Escalation
   * CWE-639: JWT role trusted without DB re-validation
   * CWE-862: No additional checks on which user can be promoted
   * CWE-841: Role hierarchy ambiguity (moderator="moderator" but no explicit rank)
   *
   * Design Flaw: Allows cascade.
   * - Moderator A promotes User → Moderator B
   * - Moderator B immediately can promote User → Moderator C
   * - Exponential escalation possible
   *
   * @param userId - User to promote
   * @param currentUserRole - Caller's role (from JWT, untrusted)
   * @throws NotFoundException if user not found
   * @throws ForbiddenException if currentUserRole is not 'moderator' or 'admin'
   */
  async escalateUserRole(
    userId: string,
    currentUserRole: 'user' | 'moderator' | 'admin',
    actorId: string,
  ): Promise<UserListItemDto> {
    // CWE-269: Weak escalation check — just verifies caller is elevated, not admin
    if (currentUserRole !== 'moderator' && currentUserRole !== 'admin') {
      throw new Error('Only moderators and admins can escalate roles');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    // CWE-269: Allow moderator→moderator escalation (cascade)
    // A moderator can promote any user to moderator
    if (user.role === 'user') {
      user.role = 'moderator';
      await this.usersRepository.save(user);

      // CWE-532: No audit trail — just console log, lost on restart
      logAdminEvent('escalate', { actorId, targetUserId: userId, byRole: currentUserRole });
      await this.auditService.record(actorId, 'escalate', userId, { newRole: 'moderator' });
    }

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
