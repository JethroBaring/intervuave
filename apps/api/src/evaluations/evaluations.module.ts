import { Module } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { GeminiService } from 'src/common/google-gemini.service';

@Module({
  controllers: [EvaluationsController],
  providers: [EvaluationsService, GeminiService],
})
export class EvaluationsModule {}
