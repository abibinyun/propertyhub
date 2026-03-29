import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { RankingService } from './ranking.service';

@Injectable()
export class PropertiesService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private rankingService: RankingService,
  ) {}

  async create(userId: string, dto: CreatePropertyDto) {
    // Check for duplicate title by same user (within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const duplicate = await this.prisma.property.findFirst({
      where: {
        userId,
        title: dto.title,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    if (duplicate) {
      throw new BadRequestException('You already have a property with this title. Please use a different title.');
    }

    const slug = await this.generateSlug(dto);

    const property = await this.prisma.property.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        slug,
        propertyType: dto.propertyType as any,
        listingType: dto.listingType as any,
        price: dto.price,
        address: dto.address,
        city: dto.city,
        district: dto.district,
        province: dto.province,
        postalCode: dto.postalCode,
        landArea: dto.landArea,
        buildingArea: dto.buildingArea,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        floors: dto.floors,
        garage: dto.garage,
        certificateType: dto.certificateType,
        yearBuilt: dto.yearBuilt,
        furnishing: dto.furnishing as any,
        videoUrl: dto.videoUrl,
        status: 'DRAFT',
        features: dto.features ? { create: dto.features.map((feature) => ({ feature })) } : undefined,
      },
      include: { features: true, images: true },
    });

    // Auto-flag + ranking in parallel (non-blocking, best-effort)
    const flagReason = this.getAutoFlagReason({ description: dto.description, price: dto.price, imageCount: 0 });
    await Promise.all([
      this.rankingService.updatePropertyRanking(property.id),
      flagReason
        ? this.prisma.property.update({ where: { id: property.id }, data: { moderationStatus: 'FLAGGED', flagReason } })
        : Promise.resolve(),
    ]);

    return property;
  }

  async findAll(query: any) {
    const { city, propertyType, listingType, minPrice, maxPrice, page = 1, limit = 10, lat, lng, radius } = query;

    // Radius search — pakai Haversine, bypass Prisma where
    if (lat && lng && radius) {
      const latN = Number(lat), lngN = Number(lng), radiusKm = Math.min(Number(radius), 100);
      const skip = (page - 1) * limit;
      const baseWhere = `
        status = 'ACTIVE'
        AND "moderationStatus" = 'APPROVED'
        AND latitude IS NOT NULL AND longitude IS NOT NULL
        ${propertyType ? `AND "propertyType" = '${propertyType}'` : ''}
        ${listingType ? `AND "listingType" = '${listingType}'` : ''}
        ${minPrice ? `AND price >= ${Number(minPrice)}` : ''}
        ${maxPrice ? `AND price <= ${Number(maxPrice)}` : ''}
        AND (6371 * acos(cos(radians(${latN})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lngN})) + sin(radians(${latN})) * sin(radians(latitude)))) <= ${radiusKm}
      `;
      const [properties, countResult]: any[] = await Promise.all([
        this.prisma.$queryRawUnsafe(`
          SELECT p.*, 
            (6371 * acos(cos(radians(${latN})) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(${lngN})) + sin(radians(${latN})) * sin(radians(p.latitude)))) AS distance_km
          FROM properties p
          WHERE ${baseWhere}
          ORDER BY distance_km ASC
          LIMIT ${Number(limit)} OFFSET ${skip}
        `),
        this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM properties p WHERE ${baseWhere}`),
      ]);
      const total = Number(countResult[0]?.count ?? 0);
      return { data: properties, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
    }

    const where: any = { status: 'ACTIVE', moderationStatus: 'APPROVED' };

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (propertyType) where.propertyType = propertyType;
    if (listingType) where.listingType = listingType;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          user: { select: { name: true, phone: true, company: true, verified: true } },
        },
        orderBy: [
          { featured: 'desc' },
          { rankScore: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(slug: string, viewerUserId?: string, meta?: { referrer?: string; userAgent?: string }) {
    const property = await this.prisma.property.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: 'asc' } },
        features: true,
        user: {
          select: {
            name: true, phone: true, email: true, company: true, verified: true,
            _count: { select: { properties: { where: { status: 'ACTIVE', moderationStatus: 'APPROVED' } } } },
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Increment views hanya jika bukan pemilik properti
    if (!viewerUserId || viewerUserId !== property.userId) {
      await Promise.all([
        this.prisma.property.update({
          where: { id: property.id },
          data: { viewsCount: { increment: 1 } },
        }),
        this.prisma.propertyView.create({
          data: {
            propertyId: property.id,
            referrer: meta?.referrer?.slice(0, 500) ?? null,
            userAgent: meta?.userAgent?.slice(0, 500) ?? null,
          },
        }),
      ]);
      this.rankingService.updatePropertyRanking(property.id).catch(() => {});
    }

    return property;
  }

  async update(userId: string, slug: string, dto: UpdatePropertyDto) {
    const property = await this.prisma.property.findUnique({ where: { slug } });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException('You can only update your own properties');
    }

    const { features, ...rest } = dto;
    const updateData: any = { ...rest };

    // Enforce minimum 3 photos when publishing
    if (rest.status === 'ACTIVE') {
      const imageCount = await this.prisma.propertyImage.count({ where: { propertyId: property.id } });
      if (imageCount < 3) {
        throw new BadRequestException('Minimal 3 foto diperlukan sebelum listing dapat dipublikasikan');
      }

      // Auto-flag suspicious listings before publishing
      const description = rest.description ?? property.description;
      const price = rest.price ?? Number(property.price);
      const flagReason = this.getAutoFlagReason({ description, price, imageCount });
      if (flagReason) {
        updateData.moderationStatus = 'FLAGGED';
        updateData.flagReason = flagReason;
      }
    }

    if (features !== undefined) {
      updateData.features = {
        deleteMany: {},
        create: features.map((feature) => ({ feature })),
      };
    }

    // Track price change before update
    const priceChanged = rest.price !== undefined && Number(rest.price) !== Number(property.price);

    const updated = await this.prisma.property.update({
      where: { slug },
      data: updateData,
      include: {
        images: true,
        features: true,
      },
    });

    // Price history + ranking boost in parallel
    await Promise.all([
      priceChanged
        ? this.prisma.priceHistory.create({ data: { propertyId: updated.id, price: updated.price } })
        : Promise.resolve(),
      this.rankingService.boostProperty(updated.id),
    ]);

    return updated;
  }

  async delete(userId: string, slug: string) {
    const property = await this.prisma.property.findUnique({ where: { slug } });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    await this.prisma.property.delete({ where: { slug } });

    return { message: 'Property deleted successfully' };
  }

  async findMyProperties(userId: string, query: { page?: number; limit?: number; search?: string; status?: string; sort?: string } = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, query.limit || 10);
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
        { district: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any =
      query.sort === 'views'     ? { viewsCount: 'desc' } :
      query.sort === 'leads'     ? { leadsCount: 'desc' } :
      query.sort === 'rank'      ? { rankScore: 'desc' } :
      query.sort === 'favorites' ? { createdAt: 'desc' } : // handled post-query
      { createdAt: 'desc' };

    let [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          ...(query.sort === 'favorites' && { _count: { select: { favorites: true } } }),
        },
        orderBy,
        skip: query.sort === 'favorites' ? 0 : skip,
        take: query.sort === 'favorites' ? undefined : limit,
      }),
      this.prisma.property.count({ where }),
    ]);

    // Sort by favorites count post-query (Prisma tidak support orderBy relation count langsung)
    if (query.sort === 'favorites') {
      data = (data as any[])
        .sort((a, b) => (b._count?.favorites ?? 0) - (a._count?.favorites ?? 0))
        .slice(skip, skip + limit);
    }

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByCategory(filters: any) {
    const { status, type, city, district, page = 1, limit = 20, minPrice, maxPrice, sort, bedrooms, minArea, certificate, furnishing } = filters;
    const where: any = { status: 'ACTIVE', moderationStatus: 'APPROVED' };

    if (status) where.listingType = this.reverseTranslateListingType(status);
    if (type) where.propertyType = this.reverseTranslatePropertyType(type);
    if (city) where.city = { contains: city.replace(/-/g, ' '), mode: 'insensitive' };
    if (district) where.district = { contains: district.replace(/-/g, ' '), mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (bedrooms) where.bedrooms = { gte: Number(bedrooms) };
    if (minArea) where.landArea = { gte: Number(minArea) };
    if (certificate) where.certificateType = certificate;
    if (furnishing) where.furnishing = furnishing;
    const orderBy: any[] = [{ featured: 'desc' }];
    if (sort === 'price_asc') orderBy.push({ price: 'asc' });
    else if (sort === 'price_desc') orderBy.push({ price: 'desc' });
    else if (sort === 'newest') orderBy.push({ createdAt: 'desc' });
    else { orderBy.push({ rankScore: 'desc' }); orderBy.push({ createdAt: 'desc' }); }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          user: { select: { name: true, phone: true, company: true } },
        },
        orderBy,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    };
  }

  private reverseTranslateListingType(slug: string): string {
    return slug === 'jual' ? 'SALE' : 'RENT';
  }

  private reverseTranslatePropertyType(slug: string): string {
    const map: Record<string, string> = {
      'rumah': 'HOUSE',
      'apartemen': 'APARTMENT',
      'tanah': 'LAND',
      'komersial': 'COMMERCIAL',
      'villa': 'VILLA',
      'gudang': 'WAREHOUSE',
    };
    return map[slug] || slug.toUpperCase();
  }


  async uploadImage(userId: string, propertyId: string, file: Express.Multer.File, isPrimary: boolean = false, order: number = 0) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException('You can only upload images to your own properties');
    }

    const imageCount = await this.prisma.propertyImage.count({ where: { propertyId } });
    if (imageCount >= 20) {
      throw new BadRequestException('Maksimal 20 foto per properti');
    }

    const url = await this.cloudinary.uploadImage(file, 'properties');

    if (isPrimary) {
      await this.prisma.propertyImage.updateMany({
        where: { propertyId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.propertyImage.create({
      data: {
        propertyId,
        url,
        isPrimary,
        order,
      },
    });
  }

  async setPrimaryImage(userId: string, imageId: string) {
    const image = await this.prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: true },
    });
    if (!image) throw new NotFoundException('Image not found');
    if (image.property.userId !== userId) throw new ForbiddenException();
    await this.prisma.propertyImage.updateMany({ where: { propertyId: image.propertyId }, data: { isPrimary: false } });
    await this.prisma.propertyImage.update({ where: { id: imageId }, data: { isPrimary: true } });
    return { message: 'Primary image updated' };
  }

  async deleteImage(userId: string, imageId: string) {
    const image = await this.prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: true },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (image.property.userId !== userId) {
      throw new ForbiddenException('You can only delete images from your own properties');
    }

    await this.cloudinary.deleteImage(image.url);
    await this.prisma.propertyImage.delete({ where: { id: imageId } });

    return { message: 'Image deleted successfully' };
  }

  async uploadFloorPlan(userId: string, propertyId: string, file: Express.Multer.File) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.userId !== userId) throw new ForbiddenException();

    const url = await this.cloudinary.uploadImage(file, 'floor-plans');
    await this.prisma.property.update({ where: { id: propertyId }, data: { floorPlanUrl: url } });
    return { floorPlanUrl: url };
  }

  async deleteFloorPlan(userId: string, propertyId: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.userId !== userId) throw new ForbiddenException();
    if (property.floorPlanUrl) await this.cloudinary.deleteImage(property.floorPlanUrl);
    await this.prisma.property.update({ where: { id: propertyId }, data: { floorPlanUrl: null } });
    return { message: 'Floor plan deleted' };
  }

  private async generateSlug(dto: CreatePropertyDto): Promise<string> {
    const title = this.slugify(dto.title);
    // Format: judul-properti (tanpa prefix status/jenis/kota)
    // URL SEO ditangani di routing, slug hanya identifier unik
    let baseSlug = title;
    let counter = 1;
    let finalSlug = baseSlug;
    while (await this.prisma.property.findUnique({ where: { slug: finalSlug } })) {
      counter++;
      finalSlug = `${baseSlug}-${counter}`;
    }
    return finalSlug;
  }

  async getAnalytics(userId: string, propertyId: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Properti tidak ditemukan');
    if (property.userId !== userId) throw new NotFoundException('Properti tidak ditemukan');

    // Generate 30 hari terakhir
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    const since = days[0];

    // Leads + Views per hari (parallel)
    const [leads, views, topReferrers] = await Promise.all([
      this.prisma.lead.findMany({
        where: { propertyId, createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      this.prisma.propertyView.findMany({
        where: { propertyId, viewedAt: { gte: since } },
        select: { viewedAt: true, referrer: true },
      }),
      this.prisma.propertyView.groupBy({
        by: ['referrer'],
        where: { propertyId, referrer: { not: null } },
        _count: { referrer: true },
        orderBy: { _count: { referrer: 'desc' } },
        take: 5,
      }),
    ]);

    const leadsPerDay = new Map<string, number>();
    leads.forEach((l) => {
      const key = l.createdAt.toISOString().slice(0, 10);
      leadsPerDay.set(key, (leadsPerDay.get(key) ?? 0) + 1);
    });

    const viewsPerDay = new Map<string, number>();
    views.forEach((v) => {
      const key = v.viewedAt.toISOString().slice(0, 10);
      viewsPerDay.set(key, (viewsPerDay.get(key) ?? 0) + 1);
    });

    const data = days.map((d) => {
      const key = d.toISOString().slice(0, 10);
      const dayViews = viewsPerDay.get(key) ?? 0;
      const dayLeads = leadsPerDay.get(key) ?? 0;
      return {
        date: key,
        label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        leads: dayLeads,
        views: dayViews,
      };
    });

    const totalViews30d = views.length;
    const totalLeads30d = leads.length;
    const conversionRate = totalViews30d > 0
      ? Math.round((totalLeads30d / totalViews30d) * 10000) / 100
      : 0;

    return {
      property: {
        id: property.id,
        title: property.title,
        viewsCount: property.viewsCount,
        leadsCount: property.leadsCount,
        rankScore: property.rankScore,
        featured: property.featured,
        featuredUntil: property.featuredUntil,
      },
      summary: {
        views30d: totalViews30d,
        leads30d: totalLeads30d,
        conversionRate,
      },
      topReferrers: topReferrers.map((r) => ({
        referrer: r.referrer ?? 'Direct',
        count: r._count.referrer,
      })),
      data,
    };
  }

  async getPriceHistory(userId: string, propertyId: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.userId !== userId) throw new ForbiddenException();
    return this.prisma.priceHistory.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'asc' },
      select: { price: true, createdAt: true },
    });
  }

  async getPriceHistoryBySlug(slug: string) {
    const property = await this.prisma.property.findUnique({ where: { slug } });
    if (!property) throw new NotFoundException('Property not found');
    return this.prisma.priceHistory.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: 'asc' },
      select: { price: true, createdAt: true },
    });
  }

  private getAutoFlagReason({ description, price, imageCount }: { description: string; price: number | string; imageCount: number }): string | null {
    const reasons: string[] = [];
    if (imageCount < 3) reasons.push('foto kurang dari 3');
    if ((description ?? '').length < 50) reasons.push('deskripsi terlalu singkat (< 50 karakter)');
    if (Number(price) < 10_000_000) reasons.push('harga mencurigakan (< Rp 10 juta)');
    return reasons.length ? `Auto-flag: ${reasons.join(', ')}` : null;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private translateListingType(type: string): string {
    return type === 'SALE' ? 'jual' : 'sewa';
  }

  private translatePropertyType(type: string): string {
    const map: Record<string, string> = {
      'HOUSE': 'rumah',
      'APARTMENT': 'apartemen',
      'LAND': 'tanah',
      'COMMERCIAL': 'komersial',
      'VILLA': 'villa',
      'WAREHOUSE': 'gudang',
    };
    return map[type] || type.toLowerCase();
  }
}
