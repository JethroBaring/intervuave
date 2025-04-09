/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CryptoService } from 'src/common/crypto.service';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { GoogleStorageService } from 'src/common/google-storage.service';
import { Prisma } from '@prisma/client';
import { GoogleTasksService } from 'src/common/google-tasks.service';

@Injectable()
export class PublicInterviewService {
  private readonly logger = new Logger(PublicInterviewService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly storage: GoogleStorageService,
    private readonly queue: GoogleTasksService,
  ) {}

  async accessInterview(token: string) {
    try {
      const decrypted = this.crypto.decrypt(decodeURIComponent(token));
      const { id, expiresAt } = JSON.parse(decrypted);

      if (new Date() > new Date(expiresAt)) {
        return { valid: false, reason: 'expired' };
      }

      const interview = await this.prisma.interview.findUnique({
        where: { id },
        include: {
          candidate: true,
          interviewTemplate: {
            include: {
              questions: true,
            },
          },
          company: true,
        },
      });

      if (!interview || interview.status !== 'PENDING') {
        return { valid: false, reason: 'invalid' };
      }

      return { valid: true, interview };
    } catch (err: any) {
      console.log(err);
      return { valid: false, reason: 'invalid' };
    }
  }

  async startInterview(token: string) {
    try {
      const decrypted = this.crypto.decrypt(decodeURIComponent(token));
      const { id, expiresAt } = JSON.parse(decrypted);

      if (new Date() > new Date(expiresAt)) {
        return { valid: false, reason: 'expired' };
      }

      const interview = await this.prisma.interview.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      });

      return interview;
    } catch (err: any) {
      console.log(err);
      return { valid: false, reason: 'invalid' };
    }
  }

  async submitInterview(token: string, timestamps: any) {
    try {
      const decrypted = this.crypto.decrypt(decodeURIComponent(token));
      const { id, expiresAt } = JSON.parse(decrypted);

      if (new Date() > new Date(expiresAt)) {
        return { valid: false, reason: 'expired' };
      }

      const interview = await this.prisma.interview.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          timestamps: (timestamps.timestamps ?? []) as Prisma.JsonArray,
        },
      });

      const videoUrl = await this.storage.generateInterviewViewUrl(
        interview.filename!,
        60,
      );

      const questions = (timestamps as any[]).reduce(
        (acc, t) => {
          if (t.questionId && t.questionText) {
            acc[t.questionId] = t.questionText;
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      await this.queue.addTask({
        interview_id: id,
        timestamps: timestamps,
        video_url: videoUrl,
        questions,
        callback_url: `https://dev.api.intervuave.jethdev.tech/api/v1/interviews/${id}/responses/bulk`,
        status_callback_url: `https://dev.api.intervuave.jethdev.tech/api/v1/companies/${interview.companyId}/interviews`,
      });

      return interview;
    } catch (err: any) {
      console.log(err);
      return { valid: false, reason: 'invalid' };
    }
  }

  async generateSignedInterviewUrl(token: string, dto: GenerateUploadUrlDto) {
    try {
      const decrypted = this.crypto.decrypt(decodeURIComponent(token));
      const { id, expiresAt } = JSON.parse(decrypted);

      if (new Date() > new Date(expiresAt)) {
        return { valid: false, reason: 'expired' };
      }

      const { filename, contentType } = dto;

      const uploadUrl = await this.storage.generateSignedUrl(
        filename,
        contentType,
      );

      await this.prisma.interview.update({
        where: { id },
        data: { filename },
      });

      return { uploadUrl };
    } catch (error) {
      console.log(error);
      this.logger.error('Failed to generate signed URL', error);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }
}
