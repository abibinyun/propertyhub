import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SubmitVerificationDto } from './dto/verification.dto';

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async submitVerification(userId: string, dto: SubmitVerificationDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    // Anti-fraud blacklist check
    if (user.phone) {
      const blacklistedPhone = await this.prisma.blacklist.findUnique({
        where: { value: user.phone },
      });
      if (blacklistedPhone) {
        throw new ForbiddenException(
          'Nomor telepon Anda terdaftar dalam daftar hitam anti-fraud.',
        );
      }
    }

    const blacklistedEmail = await this.prisma.blacklist.findUnique({
      where: { value: user.email },
    });
    if (blacklistedEmail) {
      throw new ForbiddenException(
        'Email Anda terdaftar dalam daftar hitam anti-fraud.',
      );
    }

    return this.prisma.agentVerification.upsert({
      where: { userId },
      create: {
        userId,
        idCardNumber: dto.idCardNumber,
        licenseNumber: dto.licenseNumber,
        idCardUrl: dto.idCardUrl,
        brokerCertificateUrl: dto.brokerCertificateUrl,
        status: 'PENDING',
      },
      update: {
        idCardNumber: dto.idCardNumber,
        licenseNumber: dto.licenseNumber,
        idCardUrl: dto.idCardUrl,
        brokerCertificateUrl: dto.brokerCertificateUrl,
        status: 'PENDING',
        rejectionReason: null,
      },
    });
  }

  async reviewVerification(
    adminId: string,
    verificationId: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string,
  ): Promise<{ message: string }> {
    const verification = await this.prisma.agentVerification.findUnique({
      where: { id: verificationId },
    });
    if (!verification) {
      throw new NotFoundException('Pengajuan verifikasi tidak ditemukan');
    }

    if (status === 'APPROVED') {
      await this.prisma.$transaction([
        this.prisma.agentVerification.update({
          where: { id: verificationId },
          data: {
            status: 'APPROVED',
            verifiedAt: new Date(),
            verifiedBy: adminId,
            rejectionReason: null,
          },
        }),
        this.prisma.user.update({
          where: { id: verification.userId },
          data: { verified: true },
        }),
      ]);

      await this.notifications.create(
        verification.userId,
        'verification_approved',
        'Verifikasi Agen Disetujui',
        'Profil Anda kini memiliki lencana Agen Terverifikasi resmi PropertyHub!',
        '/dashboard/profile',
      );

      return { message: 'Verifikasi agen berhasil disetujui' };
    } else {
      await this.prisma.agentVerification.update({
        where: { id: verificationId },
        data: {
          status: 'REJECTED',
          rejectionReason:
            rejectionReason || 'Dokumen belum memenuhi persyaratan',
          verifiedBy: adminId,
        },
      });

      await this.notifications.create(
        verification.userId,
        'verification_rejected',
        'Verifikasi Agen Ditolak',
        `Pengajuan verifikasi Anda ditolak: ${rejectionReason || 'Dokumen tidak valid'}. Silakan ajukan ulang.`,
        '/dashboard/profile',
      );

      return { message: 'Verifikasi agen ditolak' };
    }
  }

  async addBlacklist(
    type: 'PHONE' | 'EMAIL' | 'IP',
    value: string,
    reason: string,
  ) {
    return this.prisma.blacklist.create({
      data: { type, value, reason },
    });
  }
}
