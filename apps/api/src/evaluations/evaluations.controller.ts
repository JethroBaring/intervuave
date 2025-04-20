import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { UpdateEvaluationsDto } from './dto/update-evaluations.dto';
import { CreateEvaluationsDto } from './dto/create-evaluations.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller({ path: 'interviews/:interviewId/evaluation', version: '1' })
export class EvaluationsController {
  constructor(private readonly service: EvaluationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('interviewId') interviewId: string,
    @Body() dto: CreateEvaluationsDto,
  ) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findOne(@Param('interviewId') interviewId: string) {
    return this.service.findOne(interviewId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  update(
    @Param('interviewId') interviewId: string,
    @Body() dto: UpdateEvaluationsDto,
  ) {
    return this.service.update(interviewId, dto);
  }

  @Post('reprocess')
  @UseGuards(JwtAuthGuard)
  reprocess(@Param('interviewId') interviewId: string) {
    return this.service.reprocessInterview(interviewId);
  }

  @Post('reevaluate')
  @UseGuards(JwtAuthGuard)
  reevaluate(@Param('interviewId') interviewId: string) {
    return this.service.reevaluateInterview(interviewId);
  }
}
