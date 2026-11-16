/**
 * AuthService — register / login / refresh / logout (v2.10.0).
 * Soft lockout + audit on failures; public register gated by ALLOW_PUBLIC_REGISTER.
 */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { logAuthEvent, truncateSecret } from '../common/logging.util';
import { RefreshToken } from './entities/refresh-token.entity';
import { hashRefreshToken, newRefreshTokenRaw, refreshExpiresAtIso } from './refresh.util';
import { burnPasswordCompareBudget, verifyPassword } from './password.util';
import { LoginLockoutService } from './login-lockout.service';
import { AuditService } from '../admin/audit.service';
import { AlertsService } from '../admin/alerts.service';

function emailDomainOnly(email: string): string {
  const at = email.indexOf('@');
  return at >= 0 ? `*@${email.slice(at + 1)}` : '*';
}

function hashEmail(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 16);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
    private readonly lockout: LoginLockoutService,
    private readonly audit: AuditService,
    private readonly alerts: AlertsService,
  ) {}

  private async issueSession(userId: string, role: string): Promise<AuthResponseDto> {
    const token = this.jwtService.sign({ sub: userId, role });
    const refreshRaw = newRefreshTokenRaw();
    const entity = this.refreshRepo.create({
      id: randomUUID(),
      userId,
      tokenHash: hashRefreshToken(refreshRaw),
      expiresAt: refreshExpiresAtIso(),
      revoked: false,
      createdAt: new Date().toISOString(),
    });
    await this.refreshRepo.save(entity);
    return {
      token,
      refreshToken: refreshRaw,
      userId,
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    if (process.env.ALLOW_PUBLIC_REGISTER === '0') {
      throw new ForbiddenException('Public registration is disabled');
    }

    const { email, username, password } = dto;

    if (!email || !username || !password) {
      throw new BadRequestException('Missing required registration fields');
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Unable to register with the provided details');
    }

    const created = await this.usersService.create({
      email,
      username,
      password,
    });

    const session = await this.issueSession(created.id, created.role ?? 'user');
    return { ...session, message: 'Registration success' };
  }

  async login(dto: LoginDto, ip = 'unknown'): Promise<AuthResponseDto> {
    const { email, password } = dto;

    if (!email || !password) {
      throw new BadRequestException('Missing required login fields');
    }

    if (this.lockout.isLocked(email, ip)) {
      await this.audit.record('anonymous', 'login_lockout', hashEmail(email), {
        domain: emailDomainOnly(email),
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.usersService.findEntityByEmail(email);
    if (!user) {
      await burnPasswordCompareBudget(password);
      const locked = this.lockout.recordFailure(email, ip);
      await this.audit.record('anonymous', 'login_failure', hashEmail(email), {
        domain: emailDomainOnly(email),
      });
      if (locked) {
        await this.alerts.raise(
          'high',
          'login_lockout',
          'Account login temporarily locked after repeated failures',
          'login_lockout',
        );
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      const locked = this.lockout.recordFailure(email, ip);
      await this.audit.record(user.id, 'login_failure', hashEmail(email), {
        domain: emailDomainOnly(email),
      });
      if (locked) {
        await this.alerts.raise(
          'high',
          'login_lockout',
          'Account login temporarily locked after repeated failures',
          'login_lockout',
        );
        await this.audit.record(user.id, 'login_lockout', hashEmail(email), {
          domain: emailDomainOnly(email),
        });
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    this.lockout.clear(email, ip);
    const session = await this.issueSession(user.id, user.role ?? 'user');
    logAuthEvent('login', {
      userId: user.id,
      email: emailDomainOnly(user.email),
      token: truncateSecret(session.token),
    });

    return { ...session, message: 'Login success' };
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Unauthorized');
    }
    const tokenHash = hashRefreshToken(refreshToken);
    const stored = await this.refreshRepo.findOne({ where: { tokenHash } });
    if (!stored || stored.revoked) {
      throw new UnauthorizedException('Unauthorized');
    }
    if (Date.parse(stored.expiresAt) < Date.now()) {
      stored.revoked = true;
      await this.refreshRepo.save(stored);
      throw new UnauthorizedException('Unauthorized');
    }

    stored.revoked = true;
    await this.refreshRepo.save(stored);

    const user = await this.usersService.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.issueSession(user.id, user.role ?? 'user');
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.revokeAllSessions(userId);
    logAuthEvent('logout', { userId, note: 'refresh tokens revoked' });
    return { message: 'Logged out' };
  }

  /** Admin / logout — revoke every refresh row for a user (v2.10.0). */
  async revokeAllSessions(userId: string): Promise<{ revoked: true }> {
    await this.refreshRepo
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revoked: true })
      .where('"userId" = :userId AND revoked = false', { userId })
      .execute();
    logAuthEvent('revoke_all_sessions', { userId });
    return { revoked: true };
  }

  async resolveUserIdFromRefresh(rawRefreshToken: string): Promise<string> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Unauthorized');
    }
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const stored = await this.refreshRepo.findOne({ where: { tokenHash } });
    if (!stored || stored.revoked) {
      throw new UnauthorizedException('Unauthorized');
    }
    if (Date.parse(stored.expiresAt) < Date.now()) {
      throw new UnauthorizedException('Unauthorized');
    }
    return stored.userId;
  }
}
