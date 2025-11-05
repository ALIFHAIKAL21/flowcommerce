import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
// UPLOAD SERVICE
export class UploadService {
  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('❌ Missing Cloudinary environment variables');
    }

    
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    console.log('✅ Cloudinary configuration success');
  }
  
  // UPLOAD FILE TO CLOUDINARY
  async uploadFile(file: Express.Multer.File): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (err, result) => {
            if (err) {
              console.error('❌ Cloudinary upload error:', err);
              reject(new InternalServerErrorException('Upload to Cloudinary failed'));
            } else {
              resolve(result);
            }
          },
        );

        Readable.from(file.buffer).pipe(upload);
      });
    } catch (err) {
      console.error('❌ UploadService internal error:', err);
      throw new InternalServerErrorException('Upload to Cloudinary failed');
    }
  }
}
