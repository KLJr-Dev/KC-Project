/**
 * Cycle-10 — AccessRequestsService (SoftDev B6d).
 *
 * CYCLE10-PLANT: creates a new user with `role: 'moderator'`.
 * Password hashed via shared password.util (same as Auth register).
 * Conflict on existing email uses generic message (no enum of accounts).
 *
 * @see docs/security/Cycle-10/Dev/v1.10.0-auth-flow.md
 * @see docs/security/Cycle-10/Dev/v1.10.0-credential-ledger.md
 */
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { hashPassword } from '../auth/password.util';
import { AccessRequestDto } from './dto/access-request.dto';

@Injectable()
export class AccessRequestsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async submit(dto: AccessRequestDto): Promise<{ message: string; email: string; role: string }> {
    const email = (dto.email || '').trim().toLowerCase();
    const username = (dto.username || '').trim();
    const password = dto.password || '';
    if (!email || !username || !password) {
      throw new BadRequestException('email, username, and password required');
    }

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Unable to process access request');
    }

    // Sequential string IDs — same residual pattern as UsersService.create
    const count = await this.userRepo.count();
    const id = String(count + 1);
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const user = this.userRepo.create({
      id,
      email,
      username,
      password: passwordHash,
      role: 'moderator', // CYCLE10-PLANT — document staff; never admin
      createdAt: now,
      updatedAt: now,
    });
    await this.userRepo.insert(user);

    return {
      message: 'Access granted — sign in with your credentials',
      email,
      role: 'moderator',
    };
  }
}
