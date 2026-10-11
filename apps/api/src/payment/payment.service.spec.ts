import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service';
import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';

describe('PaymentService (TDD)', () => {
  let service: PaymentService;
  let prisma: any;
  let config: any;
  let notifications: any;

  const mockServerKey = 'test-midtrans-server-key';

  beforeEach(async () => {
    prisma = {
      siteSettings: { findUnique: jest.fn() },
      property: { findUnique: jest.fn(), update: jest.fn() },
      user: { findUnique: jest.fn() },
      transaction: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    config = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'PAYMENT_PROVIDER') return 'midtrans';
        if (key === 'MIDTRANS_SERVER_KEY') return mockServerKey;
        return defaultValue;
      }),
    };

    notifications = {
      create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  describe('handleNotification (Webhook Security & Idempotency)', () => {
    it('should reject webhook when signature_key is invalid', async () => {
      const payload = {
        order_id: 'FEAT-12345',
        status_code: '200',
        gross_amount: '99000.00',
        transaction_status: 'settlement',
        signature_key: 'invalid-signature-hash',
      };

      await expect(service.handleNotification(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should NOT re-activate or duplicate duration if transaction is already PAID (Idempotent)', async () => {
      const orderId = 'FEAT-12345';
      const statusCode = '200';
      const grossAmount = '99000.00';
      const validSignature = createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${mockServerKey}`)
        .digest('hex');

      const payload = {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        transaction_status: 'settlement',
        signature_key: validSignature,
      };

      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        orderId,
        propertyId: 'prop-1',
        userId: 'user-1',
        type: 'FEATURED_BASIC',
        status: 'PAID', // Already processed!
      });

      const result = await service.handleNotification(payload);

      expect(result).toEqual({ message: 'Transaction already processed' });
      expect(prisma.property.update).not.toHaveBeenCalled();
      expect(prisma.transaction.update).not.toHaveBeenCalled();
      expect(notifications.create).not.toHaveBeenCalled();
    });

    it('should successfully activate featured and mark PAID when notification is valid and unhandled', async () => {
      const orderId = 'FEAT-12345';
      const statusCode = '200';
      const grossAmount = '99000.00';
      const validSignature = createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${mockServerKey}`)
        .digest('hex');

      const payload = {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        transaction_status: 'settlement',
        signature_key: validSignature,
      };

      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        orderId,
        propertyId: 'prop-1',
        userId: 'user-1',
        type: 'FEATURED_BASIC',
        status: 'PENDING',
      });

      prisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        title: 'Rumah Mewah',
        featured: false,
        featuredUntil: null,
      });

      const result = await service.handleNotification(payload);

      expect(result).toEqual({ message: 'OK' });
      expect(prisma.property.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prop-1' },
          data: expect.objectContaining({
            featured: true,
            featuredType: 'BASIC',
          }),
        }),
      );
      expect(prisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orderId },
          data: expect.objectContaining({ status: 'PAID' }),
        }),
      );
      expect(notifications.create).toHaveBeenCalled();
    });

    it('should mark transaction CANCELLED or EXPIRED on failed statuses', async () => {
      const orderId = 'FEAT-12345';
      const statusCode = '200';
      const grossAmount = '99000.00';
      const validSignature = createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${mockServerKey}`)
        .digest('hex');

      const payload = {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        transaction_status: 'expire',
        signature_key: validSignature,
      };

      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        orderId,
        propertyId: 'prop-1',
        userId: 'user-1',
        type: 'FEATURED_BASIC',
        status: 'PENDING',
      });

      const result = await service.handleNotification(payload);

      expect(result).toEqual({ message: 'OK' });
      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { orderId },
        data: { status: 'EXPIRED' },
      });
      expect(prisma.property.update).not.toHaveBeenCalled();
    });
  });
});
