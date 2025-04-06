import { Controller, Get, Param } from '@nestjs/common';
import { PublicInterviewService } from './public-interview.service';

@Controller({ path: 'public/interviews', version: '1' })
export class PublicInterviewController {
  constructor(
    private readonly publicInterviewSerivice: PublicInterviewService,
  ) {}

  @Get(':token')
  accessInterview(@Param('token') token: string) {
    return this.publicInterviewSerivice.accessInterview(token);
  }
}
