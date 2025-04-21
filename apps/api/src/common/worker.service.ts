import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GoogleStorageService } from './google-storage.service';
@Injectable()
export class WorkerService {
  private readonly logger = new Logger(WorkerService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: GoogleStorageService,
  ) {}

  async addTask(interviewId: string) {
    try {
      // Get all workers and their number of tasks that are pending
      const workers = await this.prisma.worker.findMany({
        include: {
          tasks: {
            where: { status: 'PENDING' },
          },
        },
      });
      // Select the worker with the least number of pending tasks, if there are multiple, select the first one
      const worker = workers.sort(
        (a: any, b: any) => a.tasks.length - b.tasks.length,
      )[0];
      // Add the task to the selected worker
      await this.prisma.workerTask.create({
        data: {
          workerId: worker.id,
          interviewId,
        },
      });
      // If the worker status is waiting, trigger the evaluation immediately
      if (worker.status === 'WAITING') {
        await this.executeTask(worker.id, worker.tasks[0].id, interviewId);
      }
      // Return the worker id
    } catch (error) {
      this.logger.error(error);
      throw new Error('Failed to add task');
    }
  }

  async executeTask(workerId: string, taskId: string, interviewId: string) {
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
      this.logger.log(`Executing task ${taskId} for interview ${interviewId}`);
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

      // since this will trigger only if theres no busy worker, update the worker status to active and task status to processing
      await this.prisma.worker.update({
        where: { id: workerId },
        data: { status: 'ACTIVE' },
      });

      await this.prisma.workerTask.update({
        where: { id: taskId },
        data: { status: 'PROCESSING' },
      });
      await fetch(`${worker.url}/process-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interview_id: interviewId,
          timestamps: timestamps,
          video_url: videoUrl,
          questions,
          callback_url: `https://api.intervuave.jethdev.tech/api/v1/interviews/${interviewId}/responses/bulk`,
          status_callback_url: `https://api.intervuave.jethdev.tech/api/v1/public/interviews/${interviewId}/process`,
          next_task_callback_url: `https://api.intervuave.jethdev.tech/api/v1/public/interviews/${workerId}/next-task`,
          retry_task_callback_url: `https://api.intervuave.jethdev.tech/api/v1/public/interviews/${taskId}/retry-task`,
        }),
      });

      this.logger.log(`Task ${taskId} completed for interview ${interviewId}`);

      return { success: true };
    } catch (error) {
      await this.prisma.worker.update({
        where: { id: workerId },
        data: { status: 'WAITING' },
      });

      await this.prisma.workerTask.update({
        where: { id: taskId },
        data: { status: 'FAILED' },
      });

      this.logger.error(error);
      throw new Error('Failed to execute task');
    }
  }

  async retryTask(taskId: string) {
    const task = await this.prisma.workerTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Task not found.');
    }

    await this.prisma.workerTask.update({
      where: { id: taskId },
      data: { status: 'PENDING' },
    });

    await this.executeTask(task.workerId, taskId, task.interviewId);  
  }

  async processNextTaskForWorker(workerId: string) {
    await this.prisma.workerTask.update({
      where: { id: workerId, status: 'PROCESSING' },
      data: { status: 'COMPLETED' },
    });

    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        tasks: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  
    if (worker && worker.tasks.length > 0) {
      // Update worker status to ACTIVE if it wasn't already
      await this.prisma.worker.update({
        where: { id: workerId },
        data: { status: 'ACTIVE' },
      });
      await this.executeTask(worker.id, worker.tasks[0].id, worker.tasks[0].interviewId);
    } else {
      // No more pending tasks for this worker, set status back to WAITING
      await this.prisma.worker.update({
        where: { id: workerId },
        data: { status: 'WAITING' },
      });
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async executeTasks() {
    try {
      // Get all workers that are waiting
      const workers = await this.prisma.worker.findMany({
        where: { status: 'WAITING' },
        include: {
          tasks: {
            where: { status: 'PENDING' },
            orderBy: {
              createdAt: 'asc', // Assuming you have a 'createdAt' field
            },
          },
        }
      });
      // Get the first task from the worker that is pending
      // Execute each worker's task
      this.logger.log(`Executing ${workers.length} worker/s`);
      for (const worker of workers) {
        await this.executeTask(worker.id, worker.tasks[0].id, worker.tasks[0].interviewId);
      }
    } catch (error) {}
  }
}
