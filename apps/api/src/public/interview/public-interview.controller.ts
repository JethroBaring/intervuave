import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PublicInterviewService } from './public-interview.service';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';

@Controller({ path: 'public/interviews', version: '1' })
export class PublicInterviewController {
  constructor(
    private readonly publicInterviewSerivice: PublicInterviewService,
  ) {}

  @Get(':token')
  accessInterview(@Param('token') token: string) {
    return this.publicInterviewSerivice.accessInterview(token);
  }

  @Patch(':token/start')
  startInterview(@Param('token') token: string) {
    return this.publicInterviewSerivice.startInterview(token);
  }

  @Patch(':token/submit')
  submitInterview(@Param('token') token: string, @Body() timestamps: any) {
    return this.publicInterviewSerivice.submitInterview(token, timestamps);
  }

  @Patch(':interviewId/process')
  processInterview(@Param('interviewId') interviewId: string) {
    return this.publicInterviewSerivice.startInterviewProcessing(interviewId);
  }

  @Post(':token/generate-url')
  generateSignedInterviewUrl(
    @Param('token') token: string,
    @Body() dto: GenerateUploadUrlDto,
  ) {
    return this.publicInterviewSerivice.generateSignedInterviewUrl(token, dto);
  }
}
