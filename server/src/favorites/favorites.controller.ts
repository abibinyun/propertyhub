import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post(':propertyId')
  addFavorite(@CurrentUser() user: any, @Param('propertyId') propertyId: string) {
    return this.favoritesService.addFavorite(user.id, propertyId);
  }

  @Delete(':propertyId')
  removeFavorite(@CurrentUser() user: any, @Param('propertyId') propertyId: string) {
    return this.favoritesService.removeFavorite(user.id, propertyId);
  }

  @Get()
  getFavorites(@CurrentUser() user: any) {
    return this.favoritesService.getFavorites(user.id);
  }

  @Get('check/:propertyId')
  isFavorite(@CurrentUser() user: any, @Param('propertyId') propertyId: string) {
    return this.favoritesService.isFavorite(user.id, propertyId);
  }
}
