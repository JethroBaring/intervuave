import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';

@Module({
  controllers: [ResponsesController],
  providers: [ResponsesService],
  exports: [ResponsesService], // Optional if you want to use it in InterviewService later
})
export class ResponsesModule {}
