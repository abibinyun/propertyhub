import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '@propertyhub/shared';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post(':propertyId')
  addFavorite(
    @CurrentUser() user: RequestUser,
    @Param('propertyId') propertyId: string,
  ) {
    return this.favoritesService.addFavorite(user.id, propertyId);
  }

  @Delete(':propertyId')
  removeFavorite(
    @CurrentUser() user: RequestUser,
    @Param('propertyId') propertyId: string,
  ) {
    return this.favoritesService.removeFavorite(user.id, propertyId);
  }

  @Get()
  getFavorites(@CurrentUser() user: RequestUser) {
    return this.favoritesService.getFavorites(user.id);
  }

  @Get('ids')
  getFavoriteIds(@CurrentUser() user: RequestUser) {
    return this.favoritesService.getFavoriteIds(user.id);
  }

  @Get('property-counts')
  getPropertyFavoriteCounts(@CurrentUser() user: RequestUser) {
    return this.favoritesService.getPropertyFavoriteCounts(user.id);
  }

  @Get('check/:propertyId')
  isFavorite(
    @CurrentUser() user: RequestUser,
    @Param('propertyId') propertyId: string,
  ) {
    return this.favoritesService.isFavorite(user.id, propertyId);
  }
}
