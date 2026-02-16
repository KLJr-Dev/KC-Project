import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

let service: AuthService;
let usersService: jest.Mocked<UsersService>;

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

  service = new AuthService(usersService);
});

describe('AuthService.register', () => {

  it('creates a user and returns AuthResponseDto on success', () => {
    usersService.findByEmail.mockReturnValue(null);
    usersService.create.mockReturnValue({
      id: '2',
      email: 'new@example.com',
      username: 'new-user',
      createdAt: 'now',
      updatedAt: 'now',
    });

    const result = service.register({
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
    expect(result.token).toBe('stub-token-2');
  });

  it('rejects duplicate email with ConflictException', () => {
    usersService.findByEmail.mockReturnValue({
      id: '1',
      email: 'existing@example.com',
      username: 'existing-user',
      createdAt: 'now',
      updatedAt: 'now',
    });

    expect(() =>
      service.register({
        email: 'existing@example.com',
        username: 'someone',
        password: 'password123',
      }),
    ).toThrow(ConflictException);
  });

  it('throws BadRequestException when required fields are missing', () => {
    expect(() =>
      // @ts-expect-error — intentionally passing incomplete DTO for test
      service.register({ email: '', username: 'user' }),
    ).toThrow(BadRequestException);
  });
});

describe('AuthService.login', () => {
  const stubUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  it('returns AuthResponseDto on valid credentials', () => {
    usersService.findEntityByEmail.mockReturnValue(stubUser);

    const result = service.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(usersService.findEntityByEmail).toHaveBeenCalledWith('test@example.com');
    expect(result.userId).toBe('1');
    expect(result.token).toBe('stub-token-1');
    expect(result.message).toContain('Login success');
  });

  it('throws UnauthorizedException when email not found', () => {
    usersService.findEntityByEmail.mockReturnValue(null);

    expect(() =>
      service.login({ email: 'nobody@example.com', password: 'password123' }),
    ).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException on wrong password', () => {
    usersService.findEntityByEmail.mockReturnValue(stubUser);

    expect(() =>
      service.login({ email: 'test@example.com', password: 'wrong' }),
    ).toThrow(UnauthorizedException);
  });

  it('throws BadRequestException when required fields are missing', () => {
    expect(() =>
      // @ts-expect-error — intentionally passing incomplete DTO for test
      service.login({ email: '' }),
    ).toThrow(BadRequestException);
  });
});