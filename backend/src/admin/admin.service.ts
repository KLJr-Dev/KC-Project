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
    newRole: 'user' | 'admin',
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
