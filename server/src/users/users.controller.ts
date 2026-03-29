import { Controller, Get, Patch, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { getConfig } from '../common/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('password')
  async changePassword(
    @CurrentUser() user: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const u = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!u) throw new BadRequestException('User not found');
    const valid = await bcrypt.compare(body.currentPassword, u.password);
    if (!valid) throw new BadRequestException('Password lama tidak sesuai');
    if (body.newPassword.length < 6) throw new BadRequestException('Password minimal 6 karakter');
    const hashed = await bcrypt.hash(body.newPassword, getConfig(this.configService).bcryptRounds);
    await this.prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    return { message: 'Password berhasil diubah' };
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.usersService.getDashboardStats(user.id);
  }
}

// Public routes — no auth guard
import { Controller as PublicController } from '@nestjs/common';

@PublicController('users')
export class UsersPublicController {
  constructor(private usersService: UsersService) {}

  @Get(':id/public')
  @UseGuards(OptionalJwtAuthGuard)
  getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }
}
