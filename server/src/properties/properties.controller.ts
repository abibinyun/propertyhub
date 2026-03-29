import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Req } from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { UploadImageDto } from './dto/upload-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { getConfig } from '../common/config';

const LISTING_TYPES = ['jual', 'sewa'];
const PROPERTY_TYPES = ['rumah', 'apartemen', 'tanah', 'komersial', 'villa', 'gudang'];

@Controller('properties')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService, private configService: ConfigService) {}

  // ─── Mutations ────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(user.id, dto);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Throttle({ default: { ttl: 600000, limit: 20 } }) // 20 uploads per 10 menit
  uploadImage(
    @CurrentUser() user: any,
    @Param('id') propertyId: string,
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
      ],
    })) file: Express.Multer.File,
    @Body() dto: UploadImageDto,
  ) {
    return this.propertiesService.uploadImage(user.id, propertyId, file, dto.isPrimary, dto.order);
  }

  @Patch('images/:imageId/primary')
  @UseGuards(JwtAuthGuard)
  setPrimaryImage(@CurrentUser() user: any, @Param('imageId') imageId: string) {
    return this.propertiesService.setPrimaryImage(user.id, imageId);
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard)
  deleteImage(@CurrentUser() user: any, @Param('imageId') imageId: string) {
    return this.propertiesService.deleteImage(user.id, imageId);
  }

  @Post(':id/floor-plan')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Throttle({ default: { ttl: 600000, limit: 10 } })
  uploadFloorPlan(
    @CurrentUser() user: any,
    @Param('id') propertyId: string,
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp|pdf)$/ }),
      ],
    })) file: Express.Multer.File,
  ) {
    return this.propertiesService.uploadFloorPlan(user.id, propertyId, file);
  }

  @Delete(':id/floor-plan')
  @UseGuards(JwtAuthGuard)
  deleteFloorPlan(@CurrentUser() user: any, @Param('id') propertyId: string) {
    return this.propertiesService.deleteFloorPlan(user.id, propertyId);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  update(@CurrentUser() user: any, @Param('slug') slug: string, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.update(user.id, slug, dto);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  delete(@CurrentUser() user: any, @Param('slug') slug: string) {
    return this.propertiesService.delete(user.id, slug);
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  @Get()
  findAll(@Query() query: any) {
    return this.propertiesService.findAll(query);
  }

  @Get('my/analytics/:propertyId')
  @UseGuards(JwtAuthGuard)
  getAnalytics(@CurrentUser() user: any, @Param('propertyId') propertyId: string) {
    return this.propertiesService.getAnalytics(user.id, propertyId);
  }

  @Get('my/price-history/:propertyId')
  @UseGuards(JwtAuthGuard)
  getPriceHistory(@CurrentUser() user: any, @Param('propertyId') propertyId: string) {
    return this.propertiesService.getPriceHistory(user.id, propertyId);
  }

  @Get('price-history/:slug')
  @UseGuards(OptionalJwtAuthGuard)
  getPriceHistoryBySlug(@Param('slug') slug: string) {
    return this.propertiesService.getPriceHistoryBySlug(slug);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyProperties(    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
  ) {
    return this.propertiesService.findMyProperties(user.id, {
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      search,
      status,
      sort,
    });
  }

  @Get('properti/detail/:slug')
  @UseGuards(OptionalJwtAuthGuard)
  findBySlug(@Param('slug') slug: string, @CurrentUser() user?: any, @Req() req?: Request) {
    return this.propertiesService.findOne(slug, user?.id, {
      referrer: req?.headers?.referer,
      userAgent: req?.headers?.['user-agent'],
    });
  }

  /**
   * Detail page: /properti/:location/:slug
   * location = "kota" atau "kota-kecamatan"
   * Contoh: /properti/jakarta-selatan/rumah-mewah-3-kamar
   * Contoh: /properti/jakarta-selatan-cipete/rumah-mewah-3-kamar
   */
  @Get('properti/:location/:slug')
  findByLocationSlug(
    @Param('location') location: string,
    @Param('slug') slug: string,
  ) {
    return this.propertiesService.findOne(slug);
  }

  /**
   * List: /:status/:city/:district/:type
   * Contoh: /jual/jakarta-selatan/kebayoran-baru/rumah
   */
  @Get(':status/:city/:district/:type')
  findByCityDistrictType(
    @Param('status') status: string,
    @Param('city') city: string,
    @Param('district') district: string,
    @Param('type') type: string,
    @Query() query: any,
  ) {
    if (!LISTING_TYPES.includes(status) || !PROPERTY_TYPES.includes(type)) {
      return this.propertiesService.findAll(query);
    }
    return this.propertiesService.findByCategory({ status, city, district, type, ...query });
  }

  /**
   * List: /:status/:city/:type
   * Contoh: /jual/jakarta-selatan/rumah
   */
  @Get(':status/:city/:type')
  findByCityType(
    @Param('status') status: string,
    @Param('city') city: string,
    @Param('type') type: string,
    @Query() query: any,
  ) {
    if (!LISTING_TYPES.includes(status) || !PROPERTY_TYPES.includes(type)) {
      return this.propertiesService.findAll(query);
    }
    return this.propertiesService.findByCategory({ status, city, type, ...query });
  }

  /**
   * List: /:status/:type (type tanpa city)
   * Contoh: /jual/rumah
   */
  @Get(':status/:type')
  findByType(
    @Param('status') status: string,
    @Param('type') type: string,
    @Query() query: any,
  ) {
    if (!LISTING_TYPES.includes(status) || !PROPERTY_TYPES.includes(type)) {
      // Bukan tipe properti — anggap sebagai city
      return this.propertiesService.findByCategory({ status, city: type, ...query });
    }
    return this.propertiesService.findByCategory({ status, type, ...query });
  }

  /**
   * List: /:status (semua kota)
   * Contoh: /jual
   */
  @Get(':status')
  findByStatus(@Param('status') status: string, @Query() query: any) {
    if (!LISTING_TYPES.includes(status)) {
      return this.propertiesService.findAll(query);
    }
    return this.propertiesService.findByCategory({ status, ...query });
  }
}
