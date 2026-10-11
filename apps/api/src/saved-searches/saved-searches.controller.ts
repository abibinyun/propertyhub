import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '@propertyhub/shared';

@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
export class SavedSearchesController {
  constructor(private service: SavedSearchesService) {}

  @Get()
  getAll(@CurrentUser() user: RequestUser) {
    return this.service.getAll(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: { name: string; url: string },
  ) {
    return this.service.create(user.id, body.name, body.url);
  }

  @Delete(':id')
  delete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.delete(user.id, id);
  }
}
