import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: string, agentId: string, dto: CreateReviewDto) {
    if (authorId === agentId) throw new BadRequestException('Tidak bisa review diri sendiri');
    const agent = await this.prisma.user.findUnique({ where: { id: agentId } });
    if (!agent) throw new BadRequestException('Agen tidak ditemukan');

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
