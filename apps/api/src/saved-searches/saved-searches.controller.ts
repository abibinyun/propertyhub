import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
export class SavedSearchesController {
  constructor(private service: SavedSearchesService) {}

  @Get()
  getAll(@CurrentUser() user: any) {
    return this.service.getAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() body: { name: string; url: string }) {
    return this.service.create(user.id, body.name, body.url);
  }

  @Delete(':id')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.delete(user.id, id);
  }
}
