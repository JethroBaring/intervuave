import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { GeminiService } from "src/common/google-gemini.service";

@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService, GeminiService],
})
export class TemplatesModule {}
