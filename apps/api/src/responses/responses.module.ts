import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { EvaluationsService } from 'src/evaluations/evaluations.service';
import { GeminiService } from 'src/common/google-gemini.service';

@Module({
  controllers: [ResponsesController],
  providers: [ResponsesService, EvaluationsService, GeminiService],
})
export class ResponsesModule {}
