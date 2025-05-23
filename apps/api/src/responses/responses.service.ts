import { EvaluationWorkerService } from './../common/evaluation-worker.service';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateResponsesDto } from './dto/create-response.dto';

@Injectable()
export class ResponsesService {

  private readonly logger = new Logger(ResponsesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluationWorker: EvaluationWorkerService
  ) {}

  async bulkCreate(interviewId: string, createResponseDto: CreateResponsesDto) {
    this.logger.log(`Creating ${createResponseDto.responses.length} responses for interview ${interviewId}`);
    this.logger.log(createResponseDto.responses.map((item) => item.questionId));

    const data = createResponseDto.responses.map((item) => ({
      interviewId,
      questionId: item.questionId,
      videoChunkUrl: '', // If you want to store chunk URL, map here
      transcript: item.transcript,
      startTime: item.start,
      endTime: item.end,
      emotion: item.emotion || 'none',
      tone: '', // optional if you want to set
      eyeGaze: item.eyeGaze,
      posture: item.posture,
      gestures: item.gestures,
      movement: item.movement,
      metrics: item.metrics,
      metricsConfidence: item.metricsConfidence,
      wordTimings: item.wordTimings,
      emotionTimeline: item.emotionTimeline,
      postureTimeline: item.postureTimeline,
      gazeTimeline: item.gazeTimeline,
      pauseLocations: item.pauseLocations,
      disfluencies: item.disfluencies,
      expressivenessTimeline: item.expressivenessTimeline,
      expressiveness: item.expressiveness,
      speechFeatures: item.speechFeatures,
      processingVersion: item.processingVersion,
      qualityFlag: item.qualityFlag,
    }));

    await this.prisma.response.createMany({ data });  
    const task = await this.prisma.task.findFirst({
      where: {
        interviewId,
        status: 'PROCESSED',
      }
    })
    if (task) {
      this.evaluationWorker.executeTask(task.id);
    }
    return { message: 'Responses saved successfully' };
  }
}
