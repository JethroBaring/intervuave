import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Body,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewsDto } from './dto/create-interviews.dto';
import { UpdateInterviewsDto } from './dto/update-interviews.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller({ path: 'companies/:companyId/interviews', version: '1' })
export class InterviewsController {
  constructor(private readonly service: InterviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateInterviewsDto,
  ) {
    return this.service.create(companyId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Param('companyId') companyId: string) {
    return this.service.findAll(companyId);
  }

  @Get(':interviewId')
  findOne(@Param('interviewId') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':interviewId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('companyId') companyId: string,
    @Param('interviewId') interviewId: string,
    @Body() dto: UpdateInterviewsDto,
  ) {
    return this.service.update(companyId, interviewId, dto);
  }

  @Delete(':interviewId')
  @UseGuards(JwtAuthGuard)
  remove(@Param('interviewId') id: string) {
    return this.service.remove(id);
  }

  @Get(':interviewId/view-url')
  @UseGuards(JwtAuthGuard)
  getInterviewUrl(
    @Param('companyId') companyId: string,
    @Param('interviewId') interviewId: string,
  ) {
    return this.service.getInterviewViewUrl(companyId, interviewId);
  }
}
