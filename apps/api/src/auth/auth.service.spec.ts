import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    password: 'hashed_password',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  };

  const mockJwtService = {
    sign: vi.fn().mockReturnValue('mock_token'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('deve criar usuário com senha hasheada', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockImplementation(() =>
        Promise.resolve('hashed_password'),
      );

      const result = await authService.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashed_password',
      });
      expect(result.accessToken).toBe('mock_token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('deve rejeitar email duplicado', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('deve retornar token para credenciais válidas', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(true));

      const result = await authService.login(loginDto);

      expect(result.accessToken).toBe('mock_token');
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('deve rejeitar credenciais inválidas', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrong_password',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockImplementation(() =>
        Promise.resolve(false),
      );

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve rejeitar email não existente', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('deve retornar usuário para credenciais válidas', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(true));

      const result = await authService.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual(mockUser);
    });

    it('deve retornar null para senha inválida', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockImplementation(() =>
        Promise.resolve(false),
      );

      const result = await authService.validateUser(
        'test@example.com',
        'wrong_password',
      );

      expect(result).toBeNull();
    });

    it('deve retornar null para email não encontrado', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await authService.validateUser(
        'nonexistent@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });
  });
});
