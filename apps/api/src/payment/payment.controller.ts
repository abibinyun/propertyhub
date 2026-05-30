import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  // Buat transaksi featured → return Snap token (atau log token)
  @Post('featured/:propertyId/:featuredType')
  @UseGuards(JwtAuthGuard)
  createFeatured(
    @CurrentUser() user: any,
    @Param('propertyId') propertyId: string,
    @Param('featuredType') featuredType: string,
  ) {
    return this.paymentService.createFeaturedPayment(user.id, propertyId, featuredType.toUpperCase());
  }

  // Webhook dari Midtrans (tidak perlu auth)
  @Post('notification')
  handleNotification(@Body() body: Record<string, string>) {
    return this.paymentService.handleNotification(body);
  }

  // Dev only: aktifkan featured langsung (log mode)
  @Post('featured/:propertyId/:featuredType/activate')
  @UseGuards(JwtAuthGuard)
  activateDirect(
    @CurrentUser() user: any,
    @Param('propertyId') propertyId: string,
    @Param('featuredType') featuredType: string,
  ) {
    return this.paymentService.activateFeaturedDirect(user.id, propertyId, featuredType.toUpperCase());
  }
}
