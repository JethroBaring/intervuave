import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly storage: Storage;
  private readonly bucket: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.storage = new Storage();
    this.bucket = this.configService.get<string>('GCP_BUCKET_NAME', '');
  }

  async generateSignedUrl(dto: GenerateUploadUrlDto) {
    try {
      const { filename, contentType } = dto;
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

      const publicUrl = `https://storage.googleapis.com/${this.bucket}/${filename}`;
      // await this.prisma.interview.update({
      //   where: { id: dto.interviewId },
      //   data: { videoUrl: publicUrl },
      // });
      return { uploadUrl: url, publicUrl };
    } catch (error) {
      console.log(error);
      this.logger.error('Failed to generate signed URL', error);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }

  getPublicUri(filename: string) {
    try {
      const uri = `https://storage.googleapis.com/${this.bucket}/${filename}`;
      return { uri };
    } catch (error) {
      this.logger.error('Failed to generate public URI', error);
      throw new InternalServerErrorException('Failed to generate public URI');
    }
  }
}
