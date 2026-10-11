import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'properties', watermarkText?: string): Promise<string> {
    const uploadOptions: Record<string, any> = {
      folder,
      resource_type: 'auto',
    };

    if (watermarkText) {
      uploadOptions.transformation = [
        {
          overlay: {
            font_family: 'Arial',
            font_size: 24,
            font_weight: 'bold',
            text: watermarkText,
          },
          gravity: 'south_east',
          opacity: 50,
          x: 20,
          y: 20,
        },
      ];
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      ).end(file.buffer);
    });
  }

  async deleteImage(url: string): Promise<void> {
    const publicId = this.extractPublicId(url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  private extractPublicId(url: string): string | null {
    const match = url.match(/\/([^\/]+)\.[^\.]+$/);
    return match ? match[1] : null;
  }
}
