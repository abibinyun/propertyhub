import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentProvider } from './payment.interface';
import { LogPaymentProvider } from './log.provider';
import { MidtransPaymentProvider } from './midtrans.provider';
import { getConfig } from '../common/config';
import { randomUUID } from 'crypto';

const FEATURED_PRICE: Record<string, number> = {};
const FEATURED_DURATION_DAYS: Record<string, number> = {};

@Injectable()
export class PaymentService {
  private readonly provider: PaymentProvider;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.provider = config.get<string>('PAYMENT_PROVIDER') === 'midtrans'
      ? new MidtransPaymentProvider(config)
      : new LogPaymentProvider();
  }

  async createFeaturedPayment(userId: string, propertyId: string, featuredType: string) {
    const validTypes = ['BASIC', 'PREMIUM', 'ULTIMATE'];
    if (!validTypes.includes(featuredType)) throw new BadRequestException('Tipe featured tidak valid');

    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Properti tidak ditemukan');
    if (property.userId !== userId) throw new NotFoundException('Properti tidak ditemukan');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const cfg = getConfig(this.config);
    const amount = cfg.featuredPrices[featuredType];
    const orderId = `FEAT-${randomUUID().slice(0, 8).toUpperCase()}`;

    // Simpan transaksi pending
    await this.prisma.transaction.create({
      data: {
        userId,
        propertyId,
        type: `FEATURED_${featuredType}` as any,
        amount,
        status: 'PENDING',
        orderId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const result = await this.provider.createFeaturedPayment({
      orderId,
      amount,
      customerName: user!.name,
      customerEmail: user!.email,
      propertyTitle: property.title,
      featuredType,
    });

    return { ...result, orderId, amount, featuredType };
  }

  async handleNotification(notification: Record<string, string>) {
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    const isSuccess =
      transactionStatus === 'capture' && fraudStatus === 'accept' ||
      transactionStatus === 'settlement';

    const transaction = await this.prisma.transaction.findUnique({ where: { orderId } });
    if (!transaction) return { message: 'Transaction not found' };

    if (isSuccess) {
      const featuredType = transaction.type.replace('FEATURED_', ''); // BASIC | PREMIUM | ULTIMATE
      const days = getConfig(this.config).featuredDurationDays[featuredType] ?? 7;
      const featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      await Promise.all([
        this.prisma.transaction.update({
          where: { orderId },
          data: { status: 'PAID', paidAt: new Date() },
        }),
        this.prisma.property.update({
          where: { id: transaction.propertyId! },
          data: { featured: true, featuredUntil, featuredType: featuredType as any },
        }),
      ]);
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      await this.prisma.transaction.update({
        where: { orderId },
        data: { status: transactionStatus === 'expire' ? 'EXPIRED' : 'CANCELLED' },
      });
    }

    return { message: 'OK' };
  }

  // Untuk log mode: aktifkan featured langsung tanpa payment
  async activateFeaturedDirect(userId: string, propertyId: string, featuredType: string) {
    if (this.config.get<string>('PAYMENT_PROVIDER') === 'midtrans') {
      throw new BadRequestException('Gunakan payment flow untuk aktivasi featured');
    }

    const validTypes = ['BASIC', 'PREMIUM', 'ULTIMATE'];
    if (!validTypes.includes(featuredType)) throw new BadRequestException('Tipe featured tidak valid');

    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Properti tidak ditemukan');
    if (property.userId !== userId) throw new NotFoundException('Properti tidak ditemukan');

    const days = getConfig(this.config).featuredDurationDays[featuredType];
    const featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    return this.prisma.property.update({
      where: { id: propertyId },
      data: { featured: true, featuredUntil, featuredType: featuredType as any },
    });
  }
}
