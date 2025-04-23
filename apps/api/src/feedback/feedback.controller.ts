import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller({ path: 'evaluations/:evaluationId/feedback', version: '1' })
export class FeedbackController {
  constructor(private readonly service: FeedbackService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('evaluationId') evaluationId: string,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.service.create(evaluationId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findOne(@Param('evaluationId') id: string) {
    return this.service.findOne(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  update(@Param('evaluationId') id: string, @Body() dto: CreateFeedbackDto) {
    return this.service.update(id, dto);
  }
}
