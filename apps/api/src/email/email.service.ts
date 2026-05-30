import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendEmailOptions, EmailProvider } from './email.interface';
import { LogEmailProvider } from './log.provider';
import { ResendEmailProvider } from './resend.provider';

@Injectable()
export class EmailService implements EmailProvider {
  private readonly provider: EmailProvider;

  constructor(private config: ConfigService) {
    const providerName = this.config.get<string>('EMAIL_PROVIDER', 'log');
    this.provider = providerName === 'resend'
      ? new ResendEmailProvider(config)
      : new LogEmailProvider();
  }

  async send(options: SendEmailOptions): Promise<void> {
    return this.provider.send(options);
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:3000');
    const url = `${appUrl}/verify-email?token=${token}`;
    return this.send({
      to,
      subject: 'Verifikasi Email Anda — PropertyHub',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
          <h2 style="margin:0 0 8px;font-size:20px;color:#111">Halo, ${name}!</h2>
          <p style="color:#6b7280;margin:0 0 24px;font-size:15px">Terima kasih sudah mendaftar di PropertyHub. Klik tombol di bawah untuk memverifikasi email Anda.</p>
          <a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">Verifikasi Email</a>
          <p style="color:#9ca3af;margin:24px 0 0;font-size:13px">Link berlaku selama 24 jam. Jika Anda tidak mendaftar, abaikan email ini.</p>
          <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0">
          <p style="color:#d1d5db;font-size:12px;margin:0">PropertyHub — Platform Properti Indonesia</p>
        </div>
      `,
    });
  }

  async sendLeadNotificationEmail(
    to: string,
    ownerName: string,
    propertyTitle: string,
    lead: { name: string; phone: string; email: string; message: string },
  ): Promise<void> {
    return this.send({
      to,
      subject: `Lead baru untuk "${propertyTitle}" — PropertyHub`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
          <h2 style="margin:0 0 8px;font-size:20px;color:#111">Halo, ${ownerName}!</h2>
          <p style="color:#6b7280;margin:0 0 24px;font-size:15px">Ada yang tertarik dengan properti Anda <strong>${propertyTitle}</strong>.</p>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="margin:0 0 8px;font-size:14px"><strong>Nama:</strong> ${lead.name}</p>
            <p style="margin:0 0 8px;font-size:14px"><strong>No. HP:</strong> ${lead.phone}</p>
            <p style="margin:0 0 8px;font-size:14px"><strong>Email:</strong> ${lead.email}</p>
            <p style="margin:0;font-size:14px"><strong>Pesan:</strong> ${lead.message}</p>
          </div>
          <p style="color:#9ca3af;font-size:13px;margin:0">Segera hubungi calon pembeli/penyewa ini.</p>
          <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0">
          <p style="color:#d1d5db;font-size:12px;margin:0">PropertyHub — Platform Properti Indonesia</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:3000');
    const url = `${appUrl}/reset-password?token=${token}`;
    return this.send({
      to,
      subject: 'Reset Password — PropertyHub',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
          <h2 style="margin:0 0 8px;font-size:20px;color:#111">Halo, ${name}!</h2>
          <p style="color:#6b7280;margin:0 0 24px;font-size:15px">Kami menerima permintaan reset password untuk akun Anda. Klik tombol di bawah untuk membuat password baru.</p>
          <a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">Reset Password</a>
          <p style="color:#9ca3af;margin:24px 0 0;font-size:13px">Link berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.</p>
          <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0">
          <p style="color:#d1d5db;font-size:12px;margin:0">PropertyHub — Platform Properti Indonesia</p>
        </div>
      `,
    });
  }
}
