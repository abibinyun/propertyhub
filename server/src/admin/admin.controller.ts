import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  getAllUsers(@Query() query: any) {
    return this.adminService.getAllUsers(query);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUser(id, data);
  }

  @Get('properties')
  getAllProperties(@Query() query: any) {
    return this.adminService.getAllProperties(query);
  }

  @Patch('properties/:id/status')
  updatePropertyStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updatePropertyStatus(id, status);
  }

  @Delete('properties/:id')
  deleteProperty(@Param('id') id: string) {
    return this.adminService.deleteProperty(id);
  }

  // Moderation endpoints
  @Get('moderation/queue')
  getModerationQueue(@Query() query: any) {
    return this.adminService.getModerationQueue(query);
  }

  @Patch('moderation/:id/approve')
  approveProperty(@CurrentUser() user: any, @Param('id') id: string, @Body() data: { notes?: string }) {
    return this.adminService.approveProperty(id, user.id, data.notes);
  }

  @Patch('moderation/:id/reject')
  rejectProperty(@CurrentUser() user: any, @Param('id') id: string, @Body() data: { reason: string; notes?: string }) {
    return this.adminService.rejectProperty(id, user.id, data.reason, data.notes);
  }

  @Patch('moderation/:id/flag')
  flagProperty(@CurrentUser() user: any, @Param('id') id: string, @Body() data: { reason: string; notes?: string }) {
    return this.adminService.flagProperty(id, user.id, data.reason, data.notes);
  }

  @Get('moderation/logs')
  getModerationLogs(@Query() query: any) {
    return this.adminService.getModerationLogs(query);
  }

  @Get('leads')
  getAllLeads(@Query() query: any) {
    return this.adminService.getAllLeads(query);
  }

  @Patch('users/:id/ban')
  banUser(@Param('id') id: string, @Body() data: { reason: string }) {
    return this.adminService.banUser(id, data.reason);
  }
}
