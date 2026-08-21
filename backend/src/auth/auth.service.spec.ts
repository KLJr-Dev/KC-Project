import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';

let service: AuthService;
let usersService: jest.Mocked<UsersService>;
let jwtService: jest.Mocked<JwtService>;
let refreshRepo: jest.Mocked<Repository<RefreshToken>>;

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
    createQueryBuilder: jest.fn(),
  } as unknown as jest.Mocked<Repository<RefreshToken>>;

  service = new AuthService(usersService, jwtService, refreshRepo);
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
      createdAt: 'now',
      updatedAt: 'now',
    });

    await expect(
      service.register({
        email: 'existing@example.com',
        username: 'someone',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws BadRequestException when required fields are missing', async () => {
    await expect(
      // @ts-expect-error — intentionally passing incomplete DTO for test
      service.register({ email: '', username: 'user' }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('AuthService.login', () => {
  const stubUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
    role: 'user' as const,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  it('returns AuthResponseDto on valid credentials', async () => {
    usersService.findEntityByEmail.mockResolvedValue(stubUser);

    const result = await service.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(usersService.findEntityByEmail).toHaveBeenCalledWith('test@example.com');
    expect(result.userId).toBe('1');
    expect(result.token).toBe('mock-jwt-token');
    expect(result.refreshToken).toBeDefined();
    expect(result.message).toContain('Login success');
  });

  it('throws UnauthorizedException when email not found', async () => {
    usersService.findEntityByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'nobody@example.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException on wrong password', async () => {
    usersService.findEntityByEmail.mockResolvedValue(stubUser);

    await expect(service.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws BadRequestException when required fields are missing', async () => {
    await expect(
      // @ts-expect-error — intentionally passing incomplete DTO for test
      service.login({ email: '' }),
    ).rejects.toThrow(BadRequestException);
  });
});
