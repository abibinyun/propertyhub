import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService (TDD)', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let emailService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    emailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: jest.fn((key, def) => def ?? 10) } },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should throw ConflictException if email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'exist@mail.com' });

      await expect(
        service.register({
          email: 'exist@mail.com',
          password: 'password123',
          name: 'Existing User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password and create new user with verification email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'new@mail.com',
        name: 'New User',
        role: 'USER',
        verified: false,
        emailVerified: false,
      });

      const result = await service.register({
        email: 'new@mail.com',
        password: 'password123',
        name: 'New User',
      });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'new@mail.com',
            name: 'New User',
            verificationToken: expect.any(String),
          }),
        }),
      );
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result.token).toBe('mock-jwt-token');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if password is invalid', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@mail.com',
        password: hashedPassword,
        isBanned: false,
      });

      await expect(
        service.login({ email: 'user@mail.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is banned', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@mail.com',
        password: hashedPassword,
        isBanned: true,
      });

      await expect(
        service.login({ email: 'user@mail.com', password: 'correct-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user when credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@mail.com',
        password: hashedPassword,
        name: 'Valid User',
        role: 'USER',
        verified: true,
        emailVerified: true,
        isBanned: false,
      });

      const result = await service.login({ email: 'user@mail.com', password: 'correct-password' });

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('user@mail.com');
    });
  });

  describe('refreshAccessToken', () => {
    it('should reject invalid or expired refresh token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshAccessToken('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should issue new access token when refresh token is valid', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@mail.com',
        role: 'USER',
        refreshToken: 'valid-token',
        refreshTokenExpiry: new Date(Date.now() + 1000000),
      });

      const result = await service.refreshAccessToken('valid-token');
      expect(result.accessToken).toBe('mock-jwt-token');
    });
  });
});
