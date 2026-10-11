import { Test, TestingModule } from '@nestjs/testing';
import { VerificationService } from './verification.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ForbiddenException } from '@nestjs/common';

describe('VerificationService (TDD)', () => {
  let service: VerificationService;
  let prisma: any;
  let notifications: any;

  beforeEach(async () => {
    prisma = {
      blacklist: { findUnique: jest.fn(), create: jest.fn() },
      user: { findUnique: jest.fn(), update: jest.fn() },
      agentVerification: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(async (cbOrArr) => {
        if (Array.isArray(cbOrArr)) return Promise.all(cbOrArr);
        return cbOrArr(prisma);
      }),
    };

    notifications = {
      create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
  });

  describe('submitVerification', () => {
    it('should reject submission if user phone or email is blacklisted', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        phone: '08129999999',
        email: 'spammer@mail.com',
      });

      prisma.blacklist.findUnique.mockResolvedValue({
        id: 'bl-1',
        value: '08129999999',
        reason: 'Spam listing fraud',
      });

      await expect(
        service.submitVerification('u1', {
          idCardNumber: '3201234567890001',
          licenseNumber: 'AREBI-12345',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should submit verification with PENDING status when valid', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        phone: '08123456789',
        email: 'agent@mail.com',
      });
      prisma.blacklist.findUnique.mockResolvedValue(null); // Not blacklisted

      prisma.agentVerification.upsert.mockResolvedValue({
        id: 'verif-1',
        userId: 'u1',
        idCardNumber: '3201234567890001',
        licenseNumber: 'AREBI-12345',
        status: 'PENDING',
      });

      const result = await service.submitVerification('u1', {
        idCardNumber: '3201234567890001',
        licenseNumber: 'AREBI-12345',
        idCardUrl: 'http://cloudinary.com/ktp.jpg',
      });

      expect(prisma.agentVerification.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1' },
          create: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
      expect(result.status).toBe('PENDING');
    });
  });

  describe('reviewVerification', () => {
    it('should update verification status and set user.verified = true on APPROVAL', async () => {
      prisma.agentVerification.findUnique.mockResolvedValue({
        id: 'verif-1',
        userId: 'u1',
        status: 'PENDING',
      });

      const result = await service.reviewVerification(
        'admin-1',
        'verif-1',
        'APPROVED',
      );

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(notifications.create).toHaveBeenCalled();
      expect(result.message).toContain('disetujui');
    });

    it('should update verification status to REJECTED with reason', async () => {
      prisma.agentVerification.findUnique.mockResolvedValue({
        id: 'verif-1',
        userId: 'u1',
        status: 'PENDING',
      });

      const result = await service.reviewVerification(
        'admin-1',
        'verif-1',
        'REJECTED',
        'Foto KTP buram',
      );

      expect(result.message).toContain('ditolak');
    });
  });
});
