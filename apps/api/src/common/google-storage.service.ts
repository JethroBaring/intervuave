import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class GoogleStorageService {
  private readonly logger = new Logger(GoogleStorageService.name);
  private readonly storage: Storage;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY,
      },
    });
    this.bucket = this.configService.get<string>('GCP_BUCKET_NAME', '');
  }

  async generateSignedUrl(filename: string, contentType: string) {
    try {
      const options = {
        version: 'v4' as const,
        action: 'write' as const,
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType,
        predefinedAcl: 'publicRead', // 👈 the magic fix
      };

      const [url] = await this.storage
        .bucket(this.bucket)
        .file(filename)
        .getSignedUrl(options);

      return url;
    } catch (error) {
      console.log(error);
      this.logger.error('Failed to generate signed URL', error);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }

  // Add this method to generate a temporary viewing URL when needed
  async generateInterviewViewUrl(filename: string, expirationMinutes = 60) {
    try {
      const options = {
        version: 'v4' as const,
        action: 'read' as const,
        expires: Date.now() + expirationMinutes * 60 * 1000,
      };

      const [url] = await this.storage
        .bucket(this.bucket)
        .file(filename)
        .getSignedUrl(options);

      return url;
    } catch (error) {
      this.logger.error('Failed to generate view URL', error);
      throw new InternalServerErrorException('Failed to generate view URL');
    }
  }
}
