import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GoogleStorageService } from './google-storage.service';
import { GoogleTasksService } from './google-tasks.service';

@Injectable()
export class ProcessingWorkerService {
  private readonly logger = new Logger(ProcessingWorkerService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: GoogleStorageService,
    private readonly queue: GoogleTasksService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async executeTasks() {
    try {
      const workers = await this.prisma.worker.findMany({
        where: { status: 'AVAILABLE' },
      });

      for (const worker of workers) {
        const task = await this.prisma.task.findFirst({
          where: { status: { in: ['PENDING', 'FAILED_PROCESSING'] } },
          orderBy: { createdAt: 'asc' },
        });

        if (task) {
          await this.updateWorkerStatus(worker.id, 'BUSY');
          this.executeTask(worker.id, task.id);
        }
      }
    } catch (error) {}
  }

  async getNextWorker() {
    const worker = await this.prisma.worker.findFirst({
      where: { status: 'AVAILABLE' },
    });
    return worker;
  }

  async addTask(
    interviewId: string,
  ) {
    try {
      const task = await this.prisma.task.create({
        data: {
          interviewId,
          status: 'PENDING',
        },
      });

      const worker = await this.getNextWorker();

      if (!worker) {
        return {
          message: 'No waiting worker found, added to queue',
          success: true,
        };
      }

      this.executeTask(worker.id, task.id);

      return {
        message: 'Task is being processed',
        success: true,
      };
    } catch (error) {}
  }

  async executeTask(workerId: string, taskId: string) {
    try {
      const worker = await this.prisma.worker.findUnique({
        where: { id: workerId },
      });

      if (!worker) {
        throw new Error('Worker not found.');
      }

      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new Error('Task not found.');
      }

      await this.processInterview(task.interviewId, taskId, workerId);

      return { success: true };
    } catch (error) {}
  }

  async processInterview(
    interviewId: string,
    taskId: string,
    workerId: string,
  ) {
    try {
      const worker = await this.prisma.worker.findUnique({
        where: { id: workerId },
      });

      if (!worker) {
        throw new Error('Worker not found.');
      }

      const interview = await this.prisma.interview.findUnique({
        where: { id: interviewId },
        select: {
          id: true,
          filename: true,
          timestamps: true,
        },
      });

      if (!interview) {
        throw new Error('Interview not found.');
      }

      if (!interview.filename) {
        throw new Error('Interview video filename is missing.');
      }

      if (!interview.timestamps) {
        throw new Error('Timestamps are missing.');
      }

      const videoUrl = await this.storage.generateInterviewViewUrl(
        interview.filename,
        60,
      );

      const timestamps = interview.timestamps as any[];
      const questions = timestamps.reduce(
        (acc, t) => {
          if (t.questionId && t.questionText) {
            acc[t.questionId] = t.questionText;
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      this.logger.log(
        JSON.stringify({
          interview_id: interviewId,
          worker_url: worker.url,
        }),
      );

      await this.queue.addTask({
        interview_id: interviewId,
        timestamps: timestamps,
        video_url: videoUrl,
        questions,
        callback_url: `https://api.intervuave.jethdev.tech/api/v1/interviews/${interviewId}/responses/bulk`,
        status_callback_url: `https://api.intervuave.jethdev.tech/api/v1/public/interviews/${interviewId}/process`,
        task_status_callback_url: `https://api.intervuave.jethdev.tech/api/v1/public/interviews/${taskId}/update-task-status`,
        worker_status_callback_url: `https://api.intervuave.jethdev.tech/api/v1/public/interviews/${workerId}/update-worker-status`,
      }, `${worker.url}/process-interview`);

      return { success: true };
    } catch (error) {
      this.logger.error(error);
      throw new Error('Failed to process interview');
    }
  }

  async updateTaskStatus(
    taskId: string,
    status:
      | 'PENDING'
      | 'PROCESSING'
      | 'PROCESSED'
      | 'EVALUATING'
      | 'EVALUATED'
      | 'FAILED_PROCESSING',
  ) {
    try {
      await this.prisma.task.update({
        where: { id: taskId },
        data: { status },
      });

      if(status === 'FAILED_PROCESSING') {
        const worker = await this.getNextWorker();
        if(worker) {
          await this.updateWorkerStatus(worker.id, 'BUSY');
          this.executeTask(worker.id, taskId);
        }
      }

      return { success: true };
    } catch (error) {
      this.logger.error(error);
      throw new Error('Failed to update task status');
    }
  }

  async updateWorkerStatus(workerId: string, status: 'AVAILABLE' | 'BUSY') {
    try {
      await this.prisma.worker.update({
        where: { id: workerId },
        data: { status },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(error);
      throw new Error('Failed to update worker status');
    }
  }
}
