import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards, BadRequestException, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, ConflictException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { getConfig } from '../common/config';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private configService: ConfigService,
    private cloudinary: CloudinaryService,
  ) {}

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    // Cek username unik jika diisi
    if (dto.username) {
      const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
      if (existing && existing.id !== user.id) throw new ConflictException('Username sudah dipakai');
    }
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
        new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
      ],
    })) file: Express.Multer.File,
  ) {
    const url = await this.cloudinary.uploadImage(file, 'avatars');
    await this.prisma.user.update({ where: { id: user.id }, data: { avatar: url } });
    return { avatarUrl: url };
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

  // Lookup by username atau UUID
  @Get(':handle/public')
  @UseGuards(OptionalJwtAuthGuard)
  getPublicProfile(@Param('handle') handle: string, @Query() query: any) {
    return this.usersService.getPublicProfile(handle, query);
  }
}
