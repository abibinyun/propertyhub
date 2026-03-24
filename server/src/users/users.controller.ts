import { Controller, Get, Patch, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService, private prisma: PrismaService) {}

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
    const hashed = await bcrypt.hash(body.newPassword, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    return { message: 'Password berhasil diubah' };
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.usersService.getStats(user.id);
  }
}
