/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateInterviewsDto } from './dto/create-interviews.dto';
import { UpdateInterviewsDto } from './dto/update-interviews.dto';
import { InterviewStatus } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { CryptoService } from 'src/common/crypto.service';
import { GoogleStorageService } from 'src/common/google-storage.service';

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailService,
    private readonly crypto: CryptoService,
    private readonly storage: GoogleStorageService,
  ) {}

  async create(companyId: string, createDto: CreateInterviewsDto) {
    const {
      candidate: candidateDto,
      position,
      interviewTemplateId,
    } = createDto;
    let candidateId = candidateDto.id;

    if (!candidateId) {
      const newCandidate = await this.prisma.candidate.create({
        data: {
          firstName: candidateDto.firstName,
          lastName: candidateDto.lastName,
          email: candidateDto.email,
          companyId,
        },
      });
      candidateId = newCandidate.id;
    }

    return this.prisma.interview.create({
      data: {
        position,
        candidateId,
        interviewTemplateId,
        status: InterviewStatus.DRAFT,
        companyId,
      },
      include: {
        candidate: true,
      },
    });
  }

  async findAll(companyId: string) {
    try {
      return await this.prisma.interview.findMany({
        where: {
          candidate: {
            companyId,
          },
        },
        include: {
          candidate: true,
          interviewTemplate: true,
        },
      });
    } catch (error) {
      this.logger.error('Failed to get interviews for company', error);
      throw new InternalServerErrorException('Failed to get interviews');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.interview.findUnique({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to get interviews', error);
      throw new InternalServerErrorException('Failed to get interviews');
    }
  }

  async update(
    companyId: string,
    interviewId: string,
    updateDto: UpdateInterviewsDto,
  ) {
    try {
      const { status, ...rest } = updateDto;
      const updateData: any = { ...rest, status };

      if (status === InterviewStatus.PENDING) {
        const { interviewLink, expiresAt } =
          this.generateInterviewLink(interviewId);
        updateData.expiresAt = expiresAt;
        updateData.interviewLink = interviewLink;
      }

      const updated = await this.prisma.interview.update({
        where: { id: interviewId, companyId },
        data: updateData,
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

      await this.handlePostUpdateActions(updated);

      return updated;
    } catch (error) {
      this.logger.error('Failed to update interview', error);
      throw new InternalServerErrorException('Failed to update interview');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.interview.delete({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to delete interviews', error);
      throw new InternalServerErrorException('Failed to delete interviews');
    }
  }
  private generateInterviewLink(interviewId: string) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tokenPayload = JSON.stringify({ id: interviewId, expiresAt });
    const token = this.crypto.encrypt(tokenPayload);
    const interviewLink = `${process.env.FRONTEND_URL}/interview-final?token=${encodeURIComponent(token)}`;
    return { interviewLink, expiresAt };
  }

  private async handlePostUpdateActions(interview: any) {
    switch (interview.status) {
      case InterviewStatus.PENDING:
        await this.mailer.sendMail({
          candidateName: interview.candidate.firstName,
          candidateEmail: interview.candidate.email,
          companyName: interview.company.name,
          roleName: interview.position,
          interviewLink: interview.interviewLink,
        });
        break;

      case InterviewStatus.SUBMITTED:
        await this.processInterview(interview);
        break;

      case InterviewStatus.EVALUATED:
        await this.createEvaluation(interview);
        break;

      default:
        break;
    }
  }

  private async processInterview(interview: any) {
    const payload = {
      interviewId: interview.id,
      video_url: interview.videoUrl,
      timestamps: interview.timestamps,
      questions: interview.role.interviewTemplate.questions,
      callback_url: null,
    };

    await this.directProcessInterview(payload, interview.id);

    // if (process.env.NODE_ENV === 'production') {
    //   await this.createGoogleTask(payload, interview.id);
    // } else {
    //   await this.directProcessInterview(payload, interview.id);
    // }
  }

  /** Direct call for local testing */
  private async directProcessInterview(payload: any, interviewId: string) {
    try {
      const response = await fetch('http://localhost:8000/process-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        this.logger.error(
          `Direct processing failed for interview ${interviewId}: ${response.statusText}`,
        );
      } else {
        this.logger.log(
          `Direct processing triggered for interview ${interviewId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error while direct processing interview ${interviewId}`,
        error,
      );
    }
  }

  /** Production: Google Cloud Task */
  private async createGoogleTask(payload: any, interviewId: string) {
    try {
      await fetch('');
      // const client = new CloudTasksClient();
      // const project = process.env.GCP_PROJECT_ID;
      // const queue = process.env.GCP_QUEUE_ID;
      // const location = process.env.GCP_LOCATION;
      // const url = 'https://YOUR-WORKER-URL/process-interview'; // public worker endpoint
      // const parent = client.queuePath(project!, location!, queue!);
      // const task = {
      //   httpRequest: {
      //     httpMethod: 'POST',
      //     url,
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: Buffer.from(JSON.stringify(payload)).toString('base64'),
      //   },
      //   scheduleTime: {
      //     seconds: Date.now() / 1000 + 10, // optional 10s delay
      //   },
      //   name: `${parent}/tasks/${uuidv4()}`,
      // };
      // const [response] = await client.createTask({ parent, task });
      // this.logger.log(
      //   `GCP Task created for interview ${interviewId}: ${response.name}`,
      // );
    } catch (error) {
      this.logger.error(
        `Error creating GCP Task for interview ${interviewId}`,
        error,
      );
    }
  }

  private async createEvaluation(interview: any) {
    await fetch('');
    // await this.prisma.evaluation.create({
    //   data: {
    //     interviewId: interview.id,
    //     status: 'PENDING',
    //   },
    // });
    this.logger.log(`Created evaluation for interview ${interview.id}`);
  }

  async getInterviewViewUrl(companyId: string, interviewId: string) {
    try {
      // Get the interview to find the video path
      const interview = await this.prisma.interview.findUnique({
        where: { id: interviewId, companyId },
      });

      if (!interview || !interview.filename) {
        throw new Error('Video not found');
      }
      const viewUrl = this.storage.generateInterviewViewUrl(
        interview.filename as string,
        60,
      );

      return { viewUrl };
    } catch (error) {
      this.logger.error('Failed to generate view URL', error);
      throw new InternalServerErrorException('Failed to generate view URL');
    }
  }
}
