export interface CreateFeaturedPaymentOptions {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  propertyTitle: string;
  featuredType: string;
}

export interface PaymentResult {
  token: string;       // Snap token (Midtrans) atau dummy (log)
  redirectUrl: string; // Snap redirect URL atau dummy
}

export interface PaymentProvider {
  createFeaturedPayment(options: CreateFeaturedPaymentOptions): Promise<PaymentResult>;
}
