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
        status: 'DRAFT',
        features: dto.features
          ? {
              create: dto.features.map((feature) => ({ feature })),
            }
          : undefined,
      },
      include: {
        features: true,
        images: true,
      },
    });

    // Calculate initial ranking
    await this.rankingService.updatePropertyRanking(property.id);

    return property;
  }

  async findAll(query: any) {
    const { city, propertyType, listingType, minPrice, maxPrice, page = 1, limit = 10 } = query;

    const where: any = { status: 'ACTIVE' };

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
          user: { select: { name: true, phone: true, company: true } },
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

  async findOne(slug: string, viewerUserId?: string) {
    const property = await this.prisma.property.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: 'asc' } },
        features: true,
        user: { select: { name: true, phone: true, email: true, company: true } },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Increment views hanya jika bukan pemilik properti
    if (!viewerUserId || viewerUserId !== property.userId) {
      await this.prisma.property.update({
        where: { id: property.id },
        data: { viewsCount: { increment: 1 } },
      });
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

    const updateData: any = { ...dto };

    const updated = await this.prisma.property.update({
      where: { slug },
      data: updateData,
      include: {
        images: true,
        features: true,
      },
    });

    // Boost ranking when updated
    await this.rankingService.boostProperty(updated.id);

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
