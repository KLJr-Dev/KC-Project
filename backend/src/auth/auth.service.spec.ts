import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginLockoutService } from './login-lockout.service';
import { AuditService } from '../admin/audit.service';
import { AlertsService } from '../admin/alerts.service';

jest.mock('./password.util', () => ({
  verifyPassword: jest.fn(async (plain: string, stored: string) => plain === 'password123' && !!stored),
  burnPasswordCompareBudget: jest.fn(async () => undefined),
  hashPassword: jest.fn(async (p: string) => `hashed:${p}`),
  isBcryptHash: jest.fn(() => true),
  BCRYPT_COST: 12,
}));

let service: AuthService;
let usersService: jest.Mocked<UsersService>;
let jwtService: jest.Mocked<JwtService>;
let refreshRepo: jest.Mocked<Repository<RefreshToken>>;
let lockout: jest.Mocked<LoginLockoutService>;
let audit: jest.Mocked<AuditService>;
let alerts: jest.Mocked<AlertsService>;

beforeEach(() => {
  usersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByEmail: jest.fn(),
    findEntityByEmail: jest.fn(),
  } as unknown as jest.Mocked<UsersService>;

  jwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn(),
  } as unknown as jest.Mocked<JwtService>;

  refreshRepo = {
    create: jest.fn((x) => x),
    save: jest.fn(async (x) => x),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    })),
  } as unknown as jest.Mocked<Repository<RefreshToken>>;

  lockout = {
    isLocked: jest.fn().mockReturnValue(false),
    recordFailure: jest.fn().mockReturnValue(false),
    clear: jest.fn(),
  } as unknown as jest.Mocked<LoginLockoutService>;

  audit = {
    record: jest.fn().mockResolvedValue(undefined),
    findAll: jest.fn(),
  } as unknown as jest.Mocked<AuditService>;

  alerts = {
    raise: jest.fn().mockResolvedValue(undefined),
    findAll: jest.fn(),
    ack: jest.fn(),
  } as unknown as jest.Mocked<AlertsService>;

  service = new AuthService(usersService, jwtService, refreshRepo, lockout, audit, alerts);
});

describe('AuthService.register', () => {
  it('creates a user and returns AuthResponseDto on success', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({
      id: '2',
      email: 'new@example.com',
      username: 'new-user',
      role: 'user',
      createdAt: 'now',
      updatedAt: 'now',
    });

    const result = await service.register({
      email: 'new@example.com',
      username: 'new-user',
      password: 'password123',
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith('new@example.com');
    expect(usersService.create).toHaveBeenCalledWith({
      email: 'new@example.com',
      username: 'new-user',
      password: 'password123',
    });
    expect(result.userId).toBe('2');
    expect(result.token).toBe('mock-jwt-token');
    expect(result.refreshToken).toBeDefined();
  });

  it('rejects duplicate email with ConflictException', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'existing@example.com',
      username: 'existing-user',
      role: 'user',
      createdAt: 'now',
      updatedAt: 'now',
    });

    await expect(
      service.register({
        email: 'existing@example.com',
        username: 'x',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });
});

describe('AuthService.login', () => {
  it('returns session on valid credentials', async () => {
    usersService.findEntityByEmail.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      username: 'test',
      password: 'hashed',
      role: 'user',
      createdAt: 'now',
      updatedAt: 'now',
    } as never);

    const result = await service.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.userId).toBe('1');
    expect(lockout.clear).toHaveBeenCalled();
  });

  it('rejects unknown user', async () => {
    usersService.findEntityByEmail.mockResolvedValue(null);
    await expect(
      service.login({ email: 'nobody@example.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects wrong password', async () => {
    usersService.findEntityByEmail.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      username: 'test',
      password: 'hashed',
      role: 'user',
      createdAt: 'now',
      updatedAt: 'now',
    } as never);

    await expect(service.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects empty email', async () => {
    await expect(service.login({ email: '' } as never)).rejects.toThrow(BadRequestException);
  });
});
