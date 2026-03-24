import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(user.id, dto);
  }

  @Get('my')
  findMyLeads(@CurrentUser() user: any) {
    return this.leadsService.findMyLeads(user.id);
  }

  @Get('property/:propertyId')
  findPropertyLeads(@CurrentUser() user: any, @Param('propertyId') propertyId: string) {
    return this.leadsService.findPropertyLeads(user.id, propertyId);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.leadsService.updateStatus(user.id, id, status);
  }
}
