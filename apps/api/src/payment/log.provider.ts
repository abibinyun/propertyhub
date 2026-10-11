import { Logger } from '@nestjs/common';
import {
  PaymentProvider,
  CreateFeaturedPaymentOptions,
  PaymentResult,
} from './payment.interface';

export class LogPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(LogPaymentProvider.name);

  createFeaturedPayment(
    options: CreateFeaturedPaymentOptions,
  ): Promise<PaymentResult> {
    this.logger.log(
      `[PAYMENT LOG] Order: ${options.orderId} | Rp ${options.amount.toLocaleString('id-ID')} | User: ${options.customerName} | Tier: ${options.featuredType}`,
    );

    return Promise.resolve({
      token: `log-token-${options.orderId}`,
      redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3004'}/dashboard/properties?featured=pending&orderId=${options.orderId}`,
    });
  }
}
