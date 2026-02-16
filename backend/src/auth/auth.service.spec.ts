import { BadRequestException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService.register', () => {
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
    } as unknown as jest.Mocked<UsersService>;

    service = new AuthService(usersService);
  });

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