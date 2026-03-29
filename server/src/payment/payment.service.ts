import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentProvider } from './payment.interface';
import { LogPaymentProvider } from './log.provider';
import { MidtransPaymentProvider } from './midtrans.provider';
import { NotificationsService } from '../notifications/notifications.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentService {
  private readonly provider: PaymentProvider;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private notifications: NotificationsService,
  ) {
    this.provider = config.get<string>('PAYMENT_PROVIDER') === 'midtrans'
      ? new MidtransPaymentProvider(config)
      : new LogPaymentProvider();
  }

  /** Ambil harga dari SiteSettings DB (fallback ke env/default) */
  private async getFeaturedPrices() {
    const settings = await this.prisma.siteSettings.findUnique({ where: { id: 'default' } });
    return {
      BASIC:    settings?.priceBasic    ?? 99000,
      PREMIUM:  settings?.pricePremium  ?? 299000,
      ULTIMATE: settings?.priceUltimate ?? 599000,
    };
  }

  private getFeaturedDurationDays(featuredType: string): number {
    const map: Record<string, number> = { BASIC: 7, PREMIUM: 7, ULTIMATE: 30 };
    return map[featuredType] ?? 7;
  }

  async createFeaturedPayment(userId: string, propertyId: string, featuredType: string) {
    const validTypes = ['BASIC', 'PREMIUM', 'ULTIMATE'];
    if (!validTypes.includes(featuredType)) throw new BadRequestException('Tipe featured tidak valid');

    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Properti tidak ditemukan');
    if (property.userId !== userId) throw new NotFoundException('Properti tidak ditemukan');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const prices = await this.getFeaturedPrices();
    const amount = prices[featuredType];
    const orderId = `FEAT-${randomUUID().slice(0, 8).toUpperCase()}`;

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
      (transactionStatus === 'capture' && fraudStatus === 'accept') ||
      transactionStatus === 'settlement';

    const transaction = await this.prisma.transaction.findUnique({ where: { orderId } });
    if (!transaction) return { message: 'Transaction not found' };

    if (isSuccess) {
      await this.activateFeatured(transaction.propertyId!, transaction.type.replace('FEATURED_', ''), transaction.userId);
      await this.prisma.transaction.update({ where: { orderId }, data: { status: 'PAID', paidAt: new Date() } });
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      await this.prisma.transaction.update({
        where: { orderId },
        data: { status: transactionStatus === 'expire' ? 'EXPIRED' : 'CANCELLED' },
      });
    }

    return { message: 'OK' };
  }

  private async activateFeatured(propertyId: string, featuredType: string, userId: string) {
    const days = this.getFeaturedDurationDays(featuredType);
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return;

    // Jika sudah featured dan belum expired → extend dari featuredUntil
    const base = property.featured && property.featuredUntil && property.featuredUntil > new Date()
      ? property.featuredUntil
      : new Date();
    const featuredUntil = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

    await this.prisma.property.update({
      where: { id: propertyId },
      data: { featured: true, featuredUntil, featuredType: featuredType as any },
    });

    // Notifikasi ke owner
    await this.notifications.create(userId, 'featured_activated',
      'Featured Listing Aktif!',
      `Properti "${property.title}" kini tampil sebagai ${featuredType} hingga ${featuredUntil.toLocaleDateString('id-ID')}.`,
      `/dashboard/properties`,
    );
  }

  async activateFeaturedDirect(userId: string, propertyId: string, featuredType: string) {
    if (this.config.get<string>('PAYMENT_PROVIDER') === 'midtrans') {
      throw new BadRequestException('Gunakan payment flow untuk aktivasi featured');
    }
    const validTypes = ['BASIC', 'PREMIUM', 'ULTIMATE'];
    if (!validTypes.includes(featuredType)) throw new BadRequestException('Tipe featured tidak valid');

    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Properti tidak ditemukan');
    if (property.userId !== userId) throw new NotFoundException('Properti tidak ditemukan');

    await this.activateFeatured(propertyId, featuredType, userId);
    return this.prisma.property.findUnique({ where: { id: propertyId } });
  }
}
