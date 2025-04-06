import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  imports: [ConfigModule],
})
export class UploadModule {}
