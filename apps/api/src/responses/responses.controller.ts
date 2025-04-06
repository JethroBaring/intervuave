import { Controller, Post, Body, Param } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreateResponsesDto } from './dto/create-response.dto';

@Controller({ path: 'interviews/:interviewId/responses', version: '1' })
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post('bulk')
  bulkCreate(
    @Param('interviewId') interviewId: string,
    @Body() createResponseDto: CreateResponsesDto,
  ) {
    return this.responsesService.bulkCreate(interviewId, createResponseDto);
  }
}
