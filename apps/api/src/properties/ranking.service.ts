import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RankingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate quality score (0-100) based on listing completeness
   */
  calculateQualityScore(property: any): number {
    let score = 0;

    // Basic info (30 points)
    if (property.title?.length >= 20) score += 10;
    if (property.description?.length >= 100) score += 10;
    if (property.images?.length >= 3) score += 10;

    // Location (10 points)
    if (property.latitude && property.longitude) score += 5;
    if (property.postalCode) score += 5;

    // Specs (30 points)
    if (property.landArea) score += 5;
    if (property.buildingArea) score += 5;
    if (property.bedrooms) score += 5;
    if (property.bathrooms) score += 5;
    if (property.floors) score += 5;
    if (property.certificateType) score += 5;

    // Details (20 points)
    if (property.yearBuilt) score += 5;
    if (property.furnishing) score += 5;
    if (property.features?.length >= 3) score += 10;

    // Price (10 points)
    if (property.pricePerSqm) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Calculate freshness score (0-100) - decays over time
   */
  calculateFreshnessScore(lastBoostedAt: Date): number {
    const now = new Date();
    const daysSinceBoost = Math.floor((now.getTime() - lastBoostedAt.getTime()) / (1000 * 60 * 60 * 24));

    // Decay: 100 -> 50 over 30 days, then 50 -> 0 over next 60 days
    if (daysSinceBoost <= 30) {
      return 100 - (daysSinceBoost * 50 / 30);
    } else if (daysSinceBoost <= 90) {
      return 50 - ((daysSinceBoost - 30) * 50 / 60);
    }
    return 0;
  }

  /**
   * Calculate engagement score (0-100) based on user interactions
   */
  calculateEngagementScore(property: any): number {
    const views = property.viewsCount || 0;
    const leads = property.leadsCount || 0;
    const favorites = property.favorites?.length || 0;

    // Weighted scoring
    const viewScore = Math.min(views / 10, 30); // Max 30 points (100 views)
    const leadScore = Math.min(leads * 5, 40); // Max 40 points (8 leads)
    const favScore = Math.min(favorites * 3, 30); // Max 30 points (10 favorites)

    return Math.min(viewScore + leadScore + favScore, 100);
  }

  /**
   * Calculate user reputation (0-100) based on listing history
   */
  async calculateUserReputation(userId: string): Promise<number> {
    const stats = await this.prisma.property.aggregate({
      where: { userId, status: 'ACTIVE' },
      _avg: { qualityScore: true },
      _count: true,
    });

    const avgQuality = stats._avg.qualityScore || 0;
    const propertyCount = stats._count;

    // Base score from average quality
    let score = avgQuality * 0.7;

    // Bonus for having multiple quality listings
    if (propertyCount >= 5) score += 10;
    else if (propertyCount >= 3) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Calculate final rank score (weighted combination)
   */
  calculateRankScore(
    qualityScore: number,
    freshnessScore: number,
    engagementScore: number,
    userReputation: number,
    isFeatured: boolean,
    featuredType?: string | null,
  ): number {
    const weights = {
      quality: 0.35,
      freshness: 0.25,
      engagement: 0.25,
      reputation: 0.15,
    };

    let rankScore =
      qualityScore * weights.quality +
      freshnessScore * weights.freshness +
      engagementScore * weights.engagement +
      userReputation * weights.reputation;

    // Boost berbeda per tier — BASIC 1.3x, PREMIUM 1.5x, ULTIMATE 2x
    if (isFeatured) {
      const boostMap: Record<string, number> = {
        BASIC: 1.3,
        PREMIUM: 1.5,
        ULTIMATE: 2.0,
      };
      rankScore *= boostMap[featuredType ?? ''] ?? 1.3;
    }

    return Math.round(rankScore * 100) / 100;
  }

  /**
   * Update ranking for a single property
   */
  async updatePropertyRanking(propertyId: string): Promise<void> {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: true,
        features: true,
        favorites: true,
      },
    });

    if (!property) return;

    const qualityScore = this.calculateQualityScore(property);
    // Freeze freshness saat featured — tidak turun selama masa featured aktif
    const freshnessScore = property.featured
      ? 100
      : this.calculateFreshnessScore(property.lastBoostedAt);
    const engagementScore = this.calculateEngagementScore(property);
    const userReputation = await this.calculateUserReputation(property.userId);

    const rankScore = this.calculateRankScore(
      qualityScore,
      freshnessScore,
      engagementScore,
      userReputation,
      property.featured,
      property.featuredType,
    );

    await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        qualityScore,
        freshnessScore,
        rankScore,
      },
    });
  }

  /**
   * Boost property ranking (when updated)
   */
  async boostProperty(propertyId: string): Promise<void> {
    await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        lastBoostedAt: new Date(),
        freshnessScore: 100,
      },
    });

    await this.updatePropertyRanking(propertyId);
  }

  /**
   * Batch update rankings (for cron job)
   */
  async updateAllRankings(): Promise<void> {
    const properties = await this.prisma.property.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });

    for (const property of properties) {
      await this.updatePropertyRanking(property.id);
    }
  }
}
