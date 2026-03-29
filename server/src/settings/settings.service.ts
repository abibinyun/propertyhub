import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const DEFAULT_ID = 'default';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async get() {
    return this.prisma.siteSettings.upsert({
      where: { id: DEFAULT_ID },
      create: { id: DEFAULT_ID },
      update: {},
    });
  }

  async update(data: any) {
    return this.prisma.siteSettings.upsert({
      where: { id: DEFAULT_ID },
      create: { id: DEFAULT_ID, ...data },
      update: data,
    });
  }

  async uploadLogo(file: Express.Multer.File) {
    const url = await this.cloudinary.uploadImage(file, 'site');
    await this.update({ logoUrl: url });
    return { logoUrl: url };
  }

  async uploadFavicon(file: Express.Multer.File) {
    const url = await this.cloudinary.uploadImage(file, 'site');
    await this.update({ faviconUrl: url });
    return { faviconUrl: url };
  }
}
