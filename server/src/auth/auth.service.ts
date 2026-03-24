import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationToken = randomUUID();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

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

    const token = this.generateToken(user.id, user.email, user.role);
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(user.id, user.email, user.role);
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified },
      token,
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

    // Rate limit: cek apakah token lama masih fresh (< 5 menit)
    if (user.verificationTokenExpiry) {
      const tokenAge = Date.now() - (user.verificationTokenExpiry.getTime() - 24 * 60 * 60 * 1000);
      if (tokenAge < 5 * 60 * 1000) {
        throw new BadRequestException('Tunggu 5 menit sebelum kirim ulang');
      }
    }

    const verificationToken = randomUUID();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: { verificationToken, verificationTokenExpiry },
    });

    await this.emailService.sendVerificationEmail(user.email, user.name, verificationToken);
    return { message: 'Email verifikasi telah dikirim' };
  }

  private generateToken(userId: string, email: string, role: string) {
    return this.jwtService.sign({ sub: userId, email, role });
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, verified: true, emailVerified: true },
    });
  }
}
