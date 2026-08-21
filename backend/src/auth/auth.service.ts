import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { logAuthEvent, truncateSecret } from '../common/logging.util';
import { RefreshToken } from './entities/refresh-token.entity';
import { hashRefreshToken, newRefreshTokenRaw, refreshExpiresAtIso } from './refresh.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
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

    const session = await this.issueSession(created.id, created.role);
    return { ...session, message: 'Registration success' };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = dto;

    if (!email || !password) {
      throw new BadRequestException('Missing required login fields');
    }

    const user = await this.usersService.findEntityByEmail(email);
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await this.issueSession(user.id, user.role);
    logAuthEvent('login', {
      userId: user.id,
      email: user.email,
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

    // Rotate: revoke old, issue new pair
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

  /** Revoke all refresh tokens for the user. Access JWT expires naturally. */
  async logout(userId: string): Promise<{ message: string }> {
    await this.refreshRepo
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revoked: true })
      .where('"userId" = :userId AND revoked = false', { userId })
      .execute();
    logAuthEvent('logout', { userId, note: 'refresh tokens revoked' });
    return { message: 'Logged out' };
  }
}
