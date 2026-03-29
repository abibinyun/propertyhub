import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  @Throttle({ short: { ttl: 60000, limit: 3 }, medium: { ttl: 86400000, limit: 10 } })
  // Max 3 leads per menit, max 10 leads per hari per user
  create(@CurrentUser() user: any, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(user.id, dto);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: any) {
    return this.leadsService.getUnreadCount(user.id);
  }

  @Get('received/export')
  async exportReceivedLeads(@CurrentUser() user: any, @Res() res: Response) {
    const { data } = await this.leadsService.findReceivedLeads(user.id, { limit: 10000 });
    const header = 'Nama,Email,Telepon,Pesan,Properti,Status,Tanggal\n';
    const rows = data.map((l) => [
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.message.replace(/"/g, '""')}"`,
      `"${(l.property as any)?.title ?? ''}"`,
      `"${l.status}"`,
      `"${new Date(l.createdAt).toLocaleDateString('id-ID')}"`,
    ].join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="leads-${Date.now()}.csv"`);
    res.send('\uFEFF' + header + rows); // BOM untuk Excel
  }

  @Get('received')
  findReceivedLeads(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.leadsService.findReceivedLeads(user.id, {
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      search,
      status,
    });
  }

  @Get('my')
  findMyLeads(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.leadsService.findMyLeads(user.id, {
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      search,
      status,
    });
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
