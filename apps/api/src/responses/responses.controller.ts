import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreateResponsesDto } from './dto/create-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller({ path: 'interviews/:interviewId/responses', version: '1' })
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  bulkCreate(
    @Param('interviewId') interviewId: string,
    @Body() createResponseDto: CreateResponsesDto,
  ) {
    return this.responsesService.bulkCreate(interviewId, createResponseDto);
  }
}
