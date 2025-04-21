import { EvaluationWorkerService } from './../common/evaluation-worker.service';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateResponsesDto } from './dto/create-response.dto';
import { EvaluationsService } from 'src/evaluations/evaluations.service';

@Injectable()
export class ResponsesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluationWorker: EvaluationWorkerService
  ) {}

  async bulkCreate(interviewId: string, createResponseDto: CreateResponsesDto) {
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
    await this.prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: 'EVALUATING',
      },
    });
    
    this.evaluationWorker.executeTask(interviewId);
    return { message: 'Responses saved successfully' };
  }
}
