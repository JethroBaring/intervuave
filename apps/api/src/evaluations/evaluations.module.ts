import { Module } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { GeminiService } from 'src/common/google-gemini.service';
import { GoogleStorageService } from 'src/common/google-storage.service';
import { ConfigService } from '@nestjs/config';
import { ProcessingWorkerService } from 'src/common/processing-worker.service';
import { EvaluationWorkerService } from "src/common/evaluation-worker.service";
import { GoogleTasksService } from "src/common/google-tasks.service";

  @Module({
  imports: [],
  controllers: [EvaluationsController],
  providers: [
    EvaluationsService,
    ConfigService,
  ],
})
export class EvaluationsModule {}
