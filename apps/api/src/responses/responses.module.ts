import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { EvaluationsService } from 'src/evaluations/evaluations.service';
import { GeminiService } from 'src/common/google-gemini.service';
import { ConfigService } from '@nestjs/config';
import { EvaluationWorkerService } from "src/common/evaluation-worker.service";
@Module({
  controllers: [ResponsesController],
  providers: [
    ResponsesService,
    ConfigService,
  ],
})
export class ResponsesModule {}
