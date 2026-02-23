import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { GetAdminUsersResponseDto, UserListItemDto } from './dto/get-admin-users-response.dto';

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
  ) {}

  /**
   * Get all users with their details
   * CWE-400: No pagination, no limit — full table dump
   * CWE-200: Exposes all user emails and roles
   */
  async getAllUsers(): Promise<GetAdminUsersResponseDto> {
    const users = await this.usersRepository.find({
      select: ['id', 'email', 'username', 'role', 'createdAt', 'updatedAt'],
      order: { createdAt: 'ASC' },
    });

    return {
      users: users.map((user) => this.mapUserToDto(user)),
      count: users.length,
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
  ): Promise<UserListItemDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    user.role = newRole;
    await this.usersRepository.save(user);

    // CWE-532: No audit of role changes — no persistent log of who changed what, when
    console.log(
      `[ADMIN] Role Changed: user="${userId}" newRole="${newRole}" (CWE-532: No Persistent Audit)`,
    );

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
      console.log(
        `[ADMIN] Escalation: user="${userId}" elevated to moderator by role="${currentUserRole}" (CWE-269, CWE-532)`,
      );
    }

    return this.mapUserToDto(user);
  }

  /**
   * Get audit logs (placeholder for v0.4.4)
   * CWE-532: No persistent audit trail implemented
   * Future: Should store all role changes, approvals, etc.
   *
   * @returns Empty array (placeholder)
   */
  async getAuditLogs(): Promise<Array<any>> {
    // TODO: Implement persistent audit log table
    // For now, return empty array as placeholder
    console.log('[AUDIT] getAuditLogs() called — no persistence yet (CWE-532)');
    return [];
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
  async deleteUser(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    // Delete the user immediately, no confirmation, no recoverability
    await this.usersRepository.remove(user);

    // CWE-532: No audit trail — log to console, lost on restart
    console.log(
      `[ADMIN] User Deleted: userId="${userId}" email="${user.email}" (CWE-862: No Auth Check, CWE-532: No Audit)`,
    );
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
