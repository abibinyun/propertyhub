import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RankingService } from '../properties/ranking.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DigestService {
  private readonly logger = new Logger(DigestService.name);

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private notifications: NotificationsService,
    private ranking: RankingService,
    private config: ConfigService,
  ) {}

  // Every Monday at 08:00 WIB (01:00 UTC)
  @Cron('0 1 * * 1')
  async sendWeeklyDigest() {
    this.logger.log('Sending weekly digest emails...');
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get all users with active properties
    const users = await this.prisma.user.findMany({
      where: { properties: { some: { status: 'ACTIVE', moderationStatus: 'APPROVED' } } },
      select: { id: true, name: true, email: true },
    });

    for (const user of users) {
      try {
        const properties = await this.prisma.property.findMany({
          where: { userId: user.id, status: 'ACTIVE', moderationStatus: 'APPROVED' },
          select: {
            id: true, title: true, slug: true, viewsCount: true, leadsCount: true,
            _count: { select: { favorites: true } },
          },
          orderBy: { viewsCount: 'desc' },
          take: 5,
        });

        // Count new leads this week
        const newLeads = await this.prisma.lead.count({
          where: { property: { userId: user.id }, createdAt: { gte: since } },
        });

        const totalViews = properties.reduce((s, p) => s + p.viewsCount, 0);
        const totalFavorites = properties.reduce((s, p) => s + p._count.favorites, 0);

        const rows = properties.map((p) => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px">
              <a href="${frontendUrl}/properti/${p.slug}" style="color:#2563eb;text-decoration:none">${p.title}</a>
            </td>
            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:center">${p.viewsCount}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:center">${p.leadsCount}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:center">${p._count.favorites}</td>
          </tr>
        `).join('');

        await this.email.send({
          to: user.email,
          subject: `Ringkasan Mingguan Properti Anda — PropertyHub`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
              <h2 style="margin:0 0 4px;font-size:20px;color:#111">Halo, ${user.name}!</h2>
              <p style="color:#6b7280;margin:0 0 24px;font-size:14px">Berikut ringkasan performa listing Anda minggu ini.</p>

              <div style="display:flex;gap:12px;margin-bottom:24px">
                <div style="flex:1;background:#eff6ff;border-radius:8px;padding:16px;text-align:center">
                  <div style="font-size:24px;font-weight:700;color:#2563eb">${totalViews}</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:2px">Total Views</div>
                </div>
                <div style="flex:1;background:#f0fdf4;border-radius:8px;padding:16px;text-align:center">
                  <div style="font-size:24px;font-weight:700;color:#16a34a">${newLeads}</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:2px">Leads Baru</div>
                </div>
                <div style="flex:1;background:#fefce8;border-radius:8px;padding:16px;text-align:center">
                  <div style="font-size:24px;font-weight:700;color:#ca8a04">${totalFavorites}</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:2px">Total Favorit</div>
                </div>
              </div>

              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <thead>
                  <tr style="background:#f9fafb">
                    <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600">Properti</th>
                    <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600">Views</th>
                    <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600">Leads</th>
                    <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600">Favorit</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>

              <a href="${frontendUrl}/dashboard" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:600;font-size:14px">Buka Dashboard</a>

              <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0">
              <p style="color:#d1d5db;font-size:12px;margin:0">PropertyHub — Platform Properti Indonesia</p>
            </div>
          `,
        });
      } catch (err) {
        this.logger.error(`Failed to send digest to ${user.email}: ${err}`);
      }
    }

    this.logger.log(`Weekly digest sent to ${users.length} users`);
  }

  // Setiap jam — expire featured yang sudah lewat
  @Cron('0 * * * *')
  async expireFeaturedListings() {
    const expired = await this.prisma.property.findMany({
      where: { featured: true, featuredUntil: { lt: new Date() } },
      select: { id: true, title: true, userId: true },
    });

    if (expired.length === 0) return;

    await this.prisma.property.updateMany({
      where: { id: { in: expired.map((p) => p.id) } },
      data: { featured: false, featuredType: null },
    });

    // Recalculate ranking + notifikasi per properti
    for (const p of expired) {
      // Recalculate ranking (featured=false sekarang, rank score turun)
      await this.ranking.updatePropertyRanking(p.id).catch(() => {});

      await this.notifications.create(
        p.userId,
        'featured_expired',
        'Featured Listing Berakhir',
        `Featured listing "${p.title}" telah berakhir. Perpanjang sekarang untuk tetap tampil di posisi teratas.`,
        `/dashboard/properties`,
      ).catch(() => {});
    }

    this.logger.log(`Expired ${expired.length} featured listings`);
  }
}
