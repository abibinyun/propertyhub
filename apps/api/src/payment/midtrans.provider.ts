import { ConfigService } from '@nestjs/config';
import * as Midtrans from 'midtrans-client';
import { PaymentProvider, CreateFeaturedPaymentOptions, PaymentResult } from './payment.interface';

export class MidtransPaymentProvider implements PaymentProvider {
  private snap: Midtrans.Snap;

  constructor(config: ConfigService) {
    this.snap = new Midtrans.Snap({
      isProduction: config.get<string>('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: config.get<string>('MIDTRANS_SERVER_KEY'),
      clientKey: config.get<string>('MIDTRANS_CLIENT_KEY'),
    });
  }

  async createFeaturedPayment(options: CreateFeaturedPaymentOptions): Promise<PaymentResult> {
    const response = await this.snap.createTransaction({
      transaction_details: { order_id: options.orderId, gross_amount: options.amount },
      item_details: [{ id: options.featuredType, price: options.amount, quantity: 1, name: `Featured ${options.featuredType} - ${options.propertyTitle}` }],
    } as any);

    return { token: response.token, redirectUrl: response.redirect_url };
  }
}
