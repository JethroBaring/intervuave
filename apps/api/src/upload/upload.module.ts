import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';
import { GoogleStorageService } from 'src/common/google-storage.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, GoogleStorageService],
  imports: [ConfigModule],
})
export class UploadModule {}
