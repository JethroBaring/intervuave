import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { EvaluationsService } from 'src/evaluations/evaluations.service';
import { GeminiService } from 'src/common/google-gemini.service';
import { GoogleStorageService } from 'src/common/google-storage.service';
import { ConfigService } from '@nestjs/config';
import { EvaluationWorkerService } from "src/common/evaluation-worker.service";
import { ProcessingWorkerService } from "src/common/processing-worker.service";
import { GoogleTasksService } from "src/common/google-tasks.service";
@Module({
  controllers: [ResponsesController],
  providers: [
    ResponsesService,
    EvaluationsService,
    GeminiService,
    GoogleStorageService,
    ConfigService,
    EvaluationWorkerService,
    EvaluationsService,
    ProcessingWorkerService,
    GoogleTasksService
  ],
})
export class ResponsesModule {}
