import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '@propertyhub/shared';

@Controller('packages')
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  @Get()
  getPackages() {
    return this.packagesService.getAvailablePackages();
  }

  @Get('my-subscription')
  @UseGuards(JwtAuthGuard)
  getMySubscription(@CurrentUser() user: RequestUser) {
    return this.packagesService.getUserActiveSubscription(user.id);
  }

  @Post('bump/:propertyId')
  @UseGuards(JwtAuthGuard)
  bumpProperty(
    @CurrentUser() user: RequestUser,
    @Param('propertyId') propertyId: string,
  ) {
    return this.packagesService.bumpProperty(user.id, propertyId);
  }
}
