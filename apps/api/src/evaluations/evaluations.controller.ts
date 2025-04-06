import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationsDto } from './dto/create-evaluations.dto';
import { UpdateEvaluationsDto } from './dto/update-evaluations.dto';

@Controller({ path: 'interviews/:interviewId/evaluation', version: '1' })
export class EvaluationsController {
  constructor(private readonly service: EvaluationsService) {}

  @Post() create(
    @Param('interviewId') interviewId: string,
    @Body() dto: CreateEvaluationsDto,
  ) {
    return this.service.create(dto);
  }

  @Get() findOne(@Param('interviewId') interviewId: string) {
    return this.service.findOne(interviewId);
  }

  @Patch() update(
    @Param('interviewId') interviewId: string,
    @Body() dto: UpdateEvaluationsDto,
  ) {
    return this.service.update(interviewId, dto);
  }
}
