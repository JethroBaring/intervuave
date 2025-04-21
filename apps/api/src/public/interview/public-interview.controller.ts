import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PublicInterviewService } from './public-interview.service';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { ProcessingWorkerService } from 'src/common/processing-worker.service';
@Controller({ path: 'public/interviews', version: '1' })
export class PublicInterviewController {
  constructor(
    private readonly publicInterviewSerivice: PublicInterviewService,
    private readonly processingWorker: ProcessingWorkerService,
  ) {}

  @Get(':token')
  accessInterview(@Param('token') token: string) {
    return this.publicInterviewSerivice.accessInterview(token);
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

  @Patch(':taskId/update-task-status')
  updateTaskStatus(@Param('taskId') taskId: string, @Body() dto: { status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'EVALUATING' | 'EVALUATED' | 'FAILED_PROCESSING'  }) {
    return this.processingWorker.updateTaskStatus(taskId, dto.status);
  }

  @Patch(':workerId/update-worker-status')
  updateWorkerStatus(@Param('workerId') workerId: string, @Body() dto: { status: 'AVAILABLE' | 'BUSY' }) {
    return this.processingWorker.updateWorkerStatus(workerId, dto.status);
  }

}
