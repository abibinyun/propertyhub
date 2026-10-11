import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConflictException, HttpException, HttpStatus } from '@nestjs/common';

describe('LeadsService (TDD)', () => {
  let service: LeadsService;
  let prisma: any;
  let emailService: any;
  let notificationsService: any;

  beforeEach(async () => {
    prisma = {
      property: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      lead: {
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(async (callbackOrPromises) => {
        if (Array.isArray(callbackOrPromises)) {
          return Promise.all(callbackOrPromises);
        }
        return callbackOrPromises(prisma);
      }),
    };

    emailService = {
      sendLeadNotificationEmail: jest.fn().mockResolvedValue(undefined),
    };

    notificationsService = {
      create: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: EmailService, useValue: emailService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  describe('create Lead (Atomicity & Anti-Spam)', () => {
    it('should prevent sending lead to own property', async () => {
      prisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        userId: 'user-owner',
      });

      await expect(
        service.create('user-owner', {
          propertyId: 'prop-1',
          name: 'Owner Self',
          email: 'owner@mail.com',
          phone: '08123456789',
          message: 'Halo',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject duplicate lead within 24 hours to same property', async () => {
      prisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        userId: 'user-owner',
      });

      prisma.lead.findFirst.mockResolvedValue({
        id: 'lead-recent',
        createdAt: new Date(),
      });

      await expect(
        service.create('user-buyer', {
          propertyId: 'prop-1',
          name: 'Buyer',
          email: 'buyer@mail.com',
          phone: '08123456789',
          message: 'Halo kedua',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create lead and increment leadsCount atomically in $transaction', async () => {
      prisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        userId: 'user-owner',
        title: 'Rumah Cantik',
      });
      prisma.lead.findFirst.mockResolvedValue(null); // No duplicate
      prisma.lead.count.mockResolvedValue(0); // Under daily limit

      const mockCreatedLead = {
        id: 'lead-new',
        propertyId: 'prop-1',
        userId: 'user-buyer',
        name: 'Buyer Pro',
        email: 'buyer@mail.com',
        phone: '08123456789',
        message: 'Tertarik survei',
        property: { id: 'prop-1', title: 'Rumah Cantik', userId: 'user-owner' },
      };

      prisma.lead.create.mockResolvedValue(mockCreatedLead);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-owner',
        email: 'owner@mail.com',
        name: 'Owner',
      });

      const result = await service.create('user-buyer', {
        propertyId: 'prop-1',
        name: 'Buyer Pro',
        email: 'buyer@mail.com',
        phone: '08123456789',
        message: 'Tertarik survei',
      });

      // Must execute within atomic $transaction
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.id).toBe('lead-new');
      expect(emailService.sendLeadNotificationEmail).toHaveBeenCalled();
    });
  });
});
