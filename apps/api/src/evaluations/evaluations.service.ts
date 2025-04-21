/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateEvaluationsDto } from './dto/create-evaluations.dto';
import { UpdateEvaluationsDto } from './dto/update-evaluations.dto';
import {
  CulturalFitEvaluation,
  GeminiService,
} from 'src/common/google-gemini.service';
import { Decision } from '@prisma/client';
import getPrismaDateTimeNow from 'src/utils/prismaDateTime';
import { GoogleStorageService } from 'src/common/google-storage.service';
import { ProcessingWorkerService } from 'src/common/processing-worker.service';
import { EvaluationWorkerService } from 'src/common/evaluation-worker.service';
@Injectable()
export class EvaluationsService {
  private readonly logger = new Logger(EvaluationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
    private readonly storage: GoogleStorageService,
    private readonly processingWorkerService: ProcessingWorkerService,
    private readonly evaluationWorkerService: EvaluationWorkerService,
  ) {}

  async findAll() {
    try {
      return await this.prisma.evaluation.findMany();
    } catch (error) {
      this.logger.error('Failed to get evaluations', error);
      throw new InternalServerErrorException('Failed to get evaluations');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.evaluation.findUnique({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to get evaluations', error);
      throw new InternalServerErrorException('Failed to get evaluations');
    }
  }

  async update(id: string, updateDto: UpdateEvaluationsDto) {
    try {
      return await this.prisma.evaluation.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      this.logger.error('Failed to update evaluations', error);
      throw new InternalServerErrorException('Failed to update evaluations');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.evaluation.delete({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to delete evaluations', error);
      throw new InternalServerErrorException('Failed to delete evaluations');
    }
  }

  async reprocessInterview(interviewId: string) {
    await this.processingWorkerService.addTask(interviewId);
  }

  async reevaluateInterview(interviewId: string) {
    const task = await this.prisma.task.create({
      data: {
        interviewId,
        status: 'PROCESSED',
      },
    });
    await this.evaluationWorkerService.executeTask(task.id);
  }
}
