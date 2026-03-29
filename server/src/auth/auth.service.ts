import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { getConfig } from '../common/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const cfg = getConfig(this.configService);
    const hashedPassword = await bcrypt.hash(dto.password, cfg.bcryptRounds);
    const verificationToken = randomUUID();
    const verificationTokenExpiry = new Date(Date.now() + cfg.verificationTokenExpiryHours * 60 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
        verificationToken,
        verificationTokenExpiry,
      },
    });

    await this.emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    const token = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified },
      token, refreshToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified },
      token, refreshToken,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({ where: { verificationToken: token } });

    if (!user) throw new BadRequestException('Token tidak valid');
    if (user.emailVerified) return { message: 'Email sudah diverifikasi' };
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      throw new BadRequestException('Token sudah kadaluarsa, minta kirim ulang');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null, verificationTokenExpiry: null },
    });

    return { message: 'Email berhasil diverifikasi' };
  }

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User tidak ditemukan');
    if (user.emailVerified) throw new BadRequestException('Email sudah diverifikasi');

    const cfg = getConfig(this.configService);
    // Rate limit: cek apakah token lama masih fresh
    if (user.verificationTokenExpiry) {
      const tokenAge = Date.now() - (user.verificationTokenExpiry.getTime() - cfg.verificationTokenExpiryHours * 60 * 60 * 1000);
      if (tokenAge < cfg.verificationResendCooldownMin * 60 * 1000) {
        throw new BadRequestException(`Tunggu ${cfg.verificationResendCooldownMin} menit sebelum kirim ulang`);
      }
    }

    const verificationToken = randomUUID();
    const verificationTokenExpiry = new Date(Date.now() + cfg.verificationTokenExpiryHours * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: { verificationToken, verificationTokenExpiry },
    });

    await this.emailService.sendVerificationEmail(user.email, user.name, verificationToken);
    return { message: 'Email verifikasi telah dikirim' };
  }

  async googleAuth(profile: { email: string; name: string; avatar: string | null }) {
    let user = await this.prisma.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
          password: '',
          emailVerified: true,
        },
      });
    }

    const token = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified }, token, refreshToken };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Selalu return success agar tidak bocorkan info email terdaftar atau tidak
    if (!user) return { message: 'Jika email terdaftar, link reset akan dikirim' };

    const resetToken = randomUUID();
    const resetTokenExpiry = new Date(Date.now() + getConfig(this.configService).resetTokenExpiryHours * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    await this.emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    return { message: 'Jika email terdaftar, link reset akan dikirim' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { resetToken: token } });
    if (!user) throw new BadRequestException('Token tidak valid atau sudah digunakan');
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Token sudah kadaluarsa, minta reset ulang');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    return { message: 'Password berhasil diubah' };
  }

  private generateToken(userId: string, email: string, role: string) {
    return this.jwtService.sign({ sub: userId, email, role });
  }

  private generateAccessToken(userId: string, email: string, role: string) {
    const cfg = getConfig(this.configService);
    return this.jwtService.sign({ sub: userId, email, role }, { expiresIn: cfg.accessTokenExpirySeconds });
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const cfg = getConfig(this.configService);
    const token = randomUUID();
    const expiry = new Date(Date.now() + cfg.refreshTokenExpiryDays * 24 * 60 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: token, refreshTokenExpiry: expiry },
    });
    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { refreshToken } });
    if (!user || !user.refreshTokenExpiry || user.refreshTokenExpiry < new Date()) {
      throw new UnauthorizedException('Refresh token tidak valid atau kadaluarsa');
    }
    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    return { accessToken };
  }

  async revokeRefreshToken(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null, refreshTokenExpiry: null },
    });
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, verified: true, emailVerified: true, isBanned: true },
    });
    if (!user || user.isBanned) throw new UnauthorizedException('Akun Anda telah dinonaktifkan');
    return user;
  }
}
