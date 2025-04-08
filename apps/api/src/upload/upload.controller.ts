import { Controller, Post, Body } from '@nestjs/common';
import { UploadService } from './upload.service';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';

@Controller({ path: 'upload', version: '1' })
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('generate-url')
  generateUploadUrl(@Body() dto: GenerateUploadUrlDto) {
    return this.uploadService.generateSignedUrl(dto);
  }
}
