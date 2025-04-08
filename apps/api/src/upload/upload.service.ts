import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { PrismaService } from 'nestjs-prisma';
import { GoogleStorageService } from 'src/common/google-storage.service';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: GoogleStorageService,
  ) {}

  async generateSignedUrl(dto: GenerateUploadUrlDto) {
    try {
      const { filename, contentType } = dto;

      const uploadUrl = await this.storage.generateSignedUrl(
        filename,
        contentType,
      );

      await this.prisma.interview.update({
        where: { id: dto.interviewId },
        data: { filename },
      });

      return { uploadUrl };
    } catch (error) {
      console.log(error);
      this.logger.error('Failed to generate signed URL', error);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }
}
