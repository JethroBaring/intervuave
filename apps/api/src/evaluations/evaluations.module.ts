import { Module } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { GeminiService } from 'src/common/google-gemini.service';
import { GoogleStorageService } from 'src/common/google-storage.service';
import { ConfigService } from '@nestjs/config';
import { WorkerService } from 'src/common/worker.service';
@Module({
  controllers: [EvaluationsController],
  providers: [
    EvaluationsService,
    GeminiService,
    GoogleStorageService,
    ConfigService,
    WorkerService,
  ],
})
export class EvaluationsModule {}
