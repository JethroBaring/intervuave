import { Module } from '@nestjs/common';

import { CryptoService } from 'src/common/crypto.service';
import { PublicInterviewController } from './interview/public-interview.controller';
import { PublicInterviewService } from './interview/public-interview.service';
import { GoogleStorageService } from 'src/common/google-storage.service';
import { ConfigService } from '@nestjs/config';
import { GoogleTasksService } from 'src/common/google-tasks.service';
import { ProcessingWorkerService } from "src/common/processing-worker.service";

@Module({
  controllers: [PublicInterviewController],
  providers: [
    PublicInterviewService,
    CryptoService,
    GoogleStorageService,
    GoogleTasksService,
    ConfigService,
    ProcessingWorkerService
  ],
})
export class PublicModule {}
