import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Body,
  Delete,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewsDto } from './dto/create-interviews.dto';
import { UpdateInterviewsDto } from './dto/update-interviews.dto';

@Controller({ path: 'companies/:companyId/interviews', version: '1' })
export class InterviewsController {
  constructor(private readonly service: InterviewsService) {}

  @Post() create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateInterviewsDto,
  ) {
    return this.service.create(companyId, dto);
  }

  @Get() findAll(@Param('companyId') companyId: string) {
    return this.service.findAll(companyId);
  }

  @Get(':interviewId') findOne(@Param('interviewId') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':interviewId') update(
    @Param('companyId') companyId: string,
    @Param('interviewId') interviewId: string,
    @Body() dto: UpdateInterviewsDto,
  ) {
    return this.service.update(companyId, interviewId, dto);
  }

  @Delete(':interviewId') remove(@Param('interviewId') id: string) {
    return this.service.remove(id);
  }
}
