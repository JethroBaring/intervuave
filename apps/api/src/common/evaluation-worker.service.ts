import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EvaluationsService } from 'src/evaluations/evaluations.service';
@Injectable()
export class EvaluationWorkerService {
  private readonly logger = new Logger(EvaluationWorkerService.name);
  private isExecuting = false;
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => EvaluationsService))
    private readonly evaluation: EvaluationsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async executeTasks() {
    try {
      const task = await this.prisma.task.findFirst({
        where: { status: { in: ['PROCESSED', 'FAILED_EVALUATION'] } },
        orderBy: { createdAt: 'asc' },
      });

      if (task) {
        this.executeTask(task.id);
      }
    } catch (error) {
      this.logger.error(error);
      throw new Error('Failed to execute tasks');
    }
  }

  async executeTask(taskId: string) {
    if(!this.isExecuting) {
      this.isExecuting = true;
      try {
        const task = await this.prisma.task.findUnique({
          where: { id: taskId },
        });
  
        if (!task) {
          throw new Error('Task not found.');
        }
  
        await this.evaluation.evaluate(task.interviewId, taskId);
  
        return { success: true };
      } catch (error) {
        this.logger.error(error);
        throw new Error('Failed to execute tasks');
      } finally {
        this.isExecuting = false;
      }
    } else {
      this.logger.warn('executeTasks skipped because another execution is in progress.');
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
      | 'FAILED_EVALUATION',
  ) {
    try {
      await this.prisma.task.update({
        where: { id: taskId },
        data: { status },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(error);
      throw new Error('Failed to update task status');
    }
  }

}
