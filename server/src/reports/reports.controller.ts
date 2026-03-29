import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: any,
    @Body() body: { propertyId: string; reason: string; notes?: string },
  ) {
    return this.reportsService.create(user.id, body.propertyId, body.reason, body.notes);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAll(@Query('resolved') resolved?: string) {
    return this.reportsService.getAll(resolved === undefined ? undefined : resolved === 'true');
  }

  @Patch(':id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  resolve(@Param('id') id: string) {
    return this.reportsService.resolve(id);
  }
}
