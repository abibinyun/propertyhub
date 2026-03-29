import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async canReview(userId: string, agentId: string): Promise<{ eligible: boolean; reason?: string }> {
    if (userId === agentId) return { eligible: false, reason: 'self' };

    const alreadyReviewed = await this.prisma.review.findUnique({
      where: { authorId_agentId: { authorId: userId, agentId } },
    });
    if (alreadyReviewed) return { eligible: false, reason: 'already_reviewed' };

    const validLead = await this.prisma.lead.findFirst({
      where: {
        userId,
        property: { userId: agentId },
        status: { in: ['CONTACTED', 'QUALIFIED', 'CLOSED'] },
      },
    });

    if (!validLead) return { eligible: false, reason: 'no_interaction' };
    return { eligible: true };
  }

  async create(authorId: string, agentId: string, dto: CreateReviewDto) {
    if (authorId === agentId) throw new BadRequestException('Tidak bisa review diri sendiri');

    const agent = await this.prisma.user.findUnique({ where: { id: agentId } });
    if (!agent) throw new BadRequestException('Agen tidak ditemukan');

    // Harus pernah kirim lead ke properti agen DAN lead sudah direspon (CONTACTED/QUALIFIED/CLOSED)
    const validLead = await this.prisma.lead.findFirst({
      where: {
        userId: authorId,
        property: { userId: agentId },
        status: { in: ['CONTACTED', 'QUALIFIED', 'CLOSED'] },
      },
    });

    if (!validLead) {
      throw new BadRequestException(
        'Anda hanya bisa memberikan ulasan setelah berinteraksi dengan agen ini (lead direspon)',
      );
    }

    try {
      return await this.prisma.review.create({
        data: { authorId, agentId, rating: dto.rating, comment: dto.comment },
        include: { author: { select: { name: true, avatar: true } } },
      });
    } catch {
      throw new ConflictException('Anda sudah pernah memberikan review untuk agen ini');
    }
  }

  async findByAgent(agentId: string) {
    const [reviews, agg] = await Promise.all([
      this.prisma.review.findMany({
        where: { agentId },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true, avatar: true } } },
      }),
      this.prisma.review.aggregate({
        where: { agentId },
        _avg: { rating: true },
        _count: true,
      }),
    ]);
    return {
      reviews,
      avgRating: agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : null,
      totalReviews: agg._count,
    };
  }
}
