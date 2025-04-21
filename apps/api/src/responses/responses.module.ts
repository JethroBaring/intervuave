import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { EvaluationsService } from 'src/evaluations/evaluations.service';
import { GeminiService } from 'src/common/google-gemini.service';
import { GoogleStorageService } from 'src/common/google-storage.service';
import { ConfigService } from '@nestjs/config';
import { WorkerService } from 'src/common/worker.service';
@Module({
  controllers: [ResponsesController],
  providers: [
    ResponsesService,
    EvaluationsService,
    GeminiService,
    GoogleStorageService,
    ConfigService,
    WorkerService,
  ],
})
export class ResponsesModule {}
