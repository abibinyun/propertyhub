import { PaymentProvider, CreateFeaturedPaymentOptions, PaymentResult } from './payment.interface';

export class LogPaymentProvider implements PaymentProvider {
  async createFeaturedPayment(options: CreateFeaturedPaymentOptions): Promise<PaymentResult> {
    console.log('\n💳 [PAYMENT - LOG MODE]');
    console.log(`Order ID  : ${options.orderId}`);
    console.log(`Amount    : Rp ${options.amount.toLocaleString('id-ID')}`);
    console.log(`Customer  : ${options.customerName} <${options.customerEmail}>`);
    console.log(`Property  : ${options.propertyTitle}`);
    console.log(`Tier      : ${options.featuredType}`);
    console.log(`→ Set PAYMENT_PROVIDER=midtrans to enable real payment\n`);

    return {
      token: `log-token-${options.orderId}`,
      redirectUrl: `http://localhost:3000/dashboard/properties?featured=pending&orderId=${options.orderId}`,
    };
  }
}
