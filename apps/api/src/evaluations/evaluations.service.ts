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
import { GeminiService } from 'src/common/google-gemini.service';
import { Decision } from '@prisma/client';
import getPrismaDateTimeNow from 'src/utils/prismaDateTime';
import { GoogleStorageService } from 'src/common/google-storage.service';

@Injectable()
export class EvaluationsService {
  private readonly logger = new Logger(EvaluationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
    private readonly storage: GoogleStorageService,
  ) {}

  async create(createDto: CreateEvaluationsDto) {
    try {
      // return await this.prisma.evaluation.create({
      //   data: createDto,
      // });
      console.log('createDto', createDto);
      await fetch('');
      return;
    } catch (error) {
      this.logger.error('Failed to create evaluations', error);
      throw new InternalServerErrorException('Failed to create evaluations');
    }
  }

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

  async evaluate(interviewId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        responses: {
          select: {
            questionId: true,
            question: {
              select: {
                alignedWith: true,
                questionText: true,
                coreValues: true,
              },
            },
            transcript: true,
          },
        },
        interviewTemplate: {
          include: {
            questions: true,
          },
        },
        company: {
          include: {
            coreValues: true,
          },
        },
      },
    });

    const cleanedData = {
      responses: interview?.responses.map((response) => ({
        questionId: response.questionId,
        questionText: response.question.questionText,
        transcript: response.transcript,
        coreValues: response.question.coreValues.split(','),
        alignsWith: response.question.alignedWith,
      })),
      companyProfile: {
        coreValues: interview?.company.coreValues.reduce(
          (acc, coreValue) => {
            acc[coreValue.name] = coreValue.description;
            return acc;
          },
          {} as Record<string, string>,
        ),
        mission: interview?.company.mission,
        vision: interview?.company.vision,
        culture: interview?.company.culture,
      },
    };

    // Step 1: Evaluate using Gemini
    const initialEvaluation = await this.gemini.evaluateWithGemini(cleanedData);

    if (!initialEvaluation) {
      throw new Error('Evaluation failed.');
    }

    // Step 2: Self-Critique the Evaluation
    const correctedEvaluation =
      await this.gemini.selfCritique(initialEvaluation);

    if (!correctedEvaluation) {
      throw new Error('Self-critique failed.');
    }

    // Step 3: Calculate scores
    const calculatedEvaluation = await this.calculateFinalScores(
      interviewId,
      correctedEvaluation,
    );

    await this.prisma.evaluation.create({
      data: calculatedEvaluation,
    });

    await this.prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: 'EVALUATED',
        evaluatedAt: getPrismaDateTimeNow(),
      },
    });

    return { message: 'success' };
  }

  async calculateFinalScores(interviewId: string, correctedEvaluation: any) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        responses: {
          select: {
            questionId: true,
            metrics: true,
          },
        },
        interviewTemplate: {
          select: {
            responseQualityWeight: true,
            cultureFitWeight: true,
          },
        },
      },
    });

    if (!interview) {
      throw new Error('Interview not found.');
    }
    console.log({ HANNAH143: JSON.stringify(interview, null, 2) });
    const { responses, interviewTemplate } = interview;

    const responseQualityWeight = interviewTemplate.responseQualityWeight ?? 30;
    const cultureFitWeight = interviewTemplate.cultureFitWeight ?? 70;

    const metricsByQuestionId = new Map<string, any>();
    for (const response of responses) {
      metricsByQuestionId.set(response.questionId, response.metrics);
    }

    const perQuestionResults: Record<string, any> = {};
    const perValueScores: Record<string, number[]> = {};

    let totalSpeechClarity = 0;
    let totalConfidence = 0;
    let totalEmotionalTone = 0;
    let totalEngagement = 0;
    let totalBodyLanguage = 0;
    let totalValuesFit = 0;
    let totalMissionAlignment = 0;
    let totalVisionAlignment = 0;
    let totalCultureFit = 0;
    let countValuesFit = 0;
    let countMissionAlignment = 0;
    let countVisionAlignment = 0;
    let countCultureFit = 0;
    let questionCount = 0;

    for (const result of correctedEvaluation.perQuestionResults) {
      const metrics = metricsByQuestionId.get(result.questionId);
      if (!metrics) {
        console.warn(`Missing metrics for question ${result.questionId}`);
        continue;
      }

      const {
        speechClarity,
        confidence,
        emotionalTone,
        engagement,
        bodyLanguage,
      } = metrics;

      // Save per-question response quality
      perQuestionResults[result.questionId] = {
        responseQuality: {
          speechClarity,
          confidence,
          emotionalTone,
          engagement,
          bodyLanguage,
        },
        cultureFitComposite: {},
        feedback: result.feedback,
      };

      totalSpeechClarity += speechClarity ?? 0;
      totalConfidence += confidence ?? 0;
      totalEmotionalTone += emotionalTone ?? 0;
      totalEngagement += engagement ?? 0;
      totalBodyLanguage += bodyLanguage ?? 0;

      const cultureFitComposite = result.cultureFitComposite;

      if (Array.isArray(cultureFitComposite.valuesFit)) {
        let avgValuesFitForThisQuestion = 0;
        for (const value of cultureFitComposite.valuesFit) {
          avgValuesFitForThisQuestion += value.score;
          if (!perValueScores[value.coreValue]) {
            perValueScores[value.coreValue] = [];
          }
          perValueScores[value.coreValue].push(value.score);
        }
        avgValuesFitForThisQuestion /= cultureFitComposite.valuesFit.length;
        perQuestionResults[result.questionId].cultureFitComposite.valuesFit =
          avgValuesFitForThisQuestion;
        totalValuesFit += avgValuesFitForThisQuestion;
        countValuesFit++;
      }

      if (cultureFitComposite.missionAlignment !== undefined) {
        perQuestionResults[
          result.questionId
        ].cultureFitComposite.missionAlignment =
          cultureFitComposite.missionAlignment;
        totalMissionAlignment += cultureFitComposite.missionAlignment;
        countMissionAlignment++;
      }

      if (cultureFitComposite.visionAlignment !== undefined) {
        perQuestionResults[
          result.questionId
        ].cultureFitComposite.visionAlignment =
          cultureFitComposite.visionAlignment;
        totalVisionAlignment += cultureFitComposite.visionAlignment;
        countVisionAlignment++;
      }

      if (cultureFitComposite.cultureFit !== undefined) {
        perQuestionResults[result.questionId].cultureFitComposite.cultureFit =
          cultureFitComposite.cultureFit;
        totalCultureFit += cultureFitComposite.cultureFit;
        countCultureFit++;
      }

      questionCount++;
    }

    if (questionCount === 0) {
      throw new Error('No valid questions found for scoring.');
    }

    // Averages
    const avgSpeechClarity = totalSpeechClarity / questionCount;
    const avgConfidence = totalConfidence / questionCount;
    const avgEmotionalTone = totalEmotionalTone / questionCount;
    const avgEngagement = totalEngagement / questionCount;
    const avgBodyLanguage = totalBodyLanguage / questionCount;

    const avgValuesFit = countValuesFit ? totalValuesFit / countValuesFit : 0;
    const avgMissionAlignment = countMissionAlignment
      ? totalMissionAlignment / countMissionAlignment
      : 0;
    const avgVisionAlignment = countVisionAlignment
      ? totalVisionAlignment / countVisionAlignment
      : 0;
    const avgCultureFit = countCultureFit
      ? totalCultureFit / countCultureFit
      : 0;

    // perValueBreakdown
    const perValueBreakdown: Record<string, number> = {};
    for (const coreValue in perValueScores) {
      const scores = perValueScores[coreValue];
      perValueBreakdown[coreValue] =
        scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    // Overall Scores
    const avgResponseQuality =
      (avgSpeechClarity +
        avgConfidence +
        avgEmotionalTone +
        avgEngagement +
        avgBodyLanguage) /
      5;
    const cultureScores = [
      avgValuesFit,
      avgMissionAlignment,
      avgVisionAlignment,
      avgCultureFit,
    ];
    const nonZeroCultureScores = cultureScores.filter((score) => score > 0);

    const avgCultureFitComposite =
      nonZeroCultureScores.length > 0
        ? nonZeroCultureScores.reduce((sum, score) => sum + score, 0) /
          nonZeroCultureScores.length
        : 0;

    const overallFitScore =
      avgResponseQuality * responseQualityWeight +
      avgCultureFitComposite * cultureFitWeight;
    const overallFitSummary = {
      overallFitScore,
      avgResponseQuality,
      avgCultureFitComposite,
      cultureFitComposite: {
        valuesFit: avgValuesFit,
        missionAlignment: avgMissionAlignment,
        visionAlignment: avgVisionAlignment,
        cultureFit: avgCultureFit,
      },
      perValueBreakdown,
    };
    // AI Decision (basic rule)
    const aiDecision =
      overallFitScore >= 0.75 ? Decision.APPROVED : Decision.REJECTED;
    const aiFeedback = await this.gemini.generateAIFeedback(overallFitSummary);
    const fallbackFeedback =
      aiDecision === 'APPROVED'
        ? "The candidate demonstrated strong communication skills and a solid understanding of the company's values."
        : 'The candidate showed some misalignment with our core values and expectations. Further evaluation may be necessary.';
    return {
      interviewId,
      overallFitScore,
      responseQuality: {
        speechClarity: avgSpeechClarity,
        confidence: avgConfidence,
        emotionalTone: avgEmotionalTone,
        engagement: avgEngagement,
        bodyLanguage: avgBodyLanguage,
      },
      cultureFitComposite: {
        valuesFit: avgValuesFit,
        missionAlignment: avgMissionAlignment,
        visionAlignment: avgVisionAlignment,
        cultureFit: avgCultureFit,
      },
      responseQualityAverage: avgResponseQuality,
      cultureFitCompositeAverage: avgCultureFitComposite,
      perQuestionResults,
      perValueBreakdown,
      aiDecision,
      aiFeedback: aiFeedback || fallbackFeedback,
    };
  }

  async reprocessInterview(interviewId: string) {
    try {
      const interview = await this.prisma.interview.findUnique({
        where: { id: interviewId },
        select: {
          id: true,
          filename: true,
          timestamps: true, // <-- use this
        },
      });
      console.log('hello');
      if (!interview) {
        throw new Error('Interview not found.');
      }

      if (!interview.filename) {
        throw new Error('Interview video filename is missing.');
      }

      if (!interview.timestamps) {
        throw new Error('Timestamps are missing.');
      }

      // Generate a signed URL to access the video
      const videoUrl = await this.storage.generateInterviewViewUrl(
        interview.filename,
        60, // 1 hour expiry
      );

      const timestamps = interview.timestamps as any[]; // Already stored from submitInterview
      const questions = timestamps.reduce(
        (acc, t) => {
          if (t.questionId && t.questionText) {
            acc[t.questionId] = t.questionText;
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      // Same as in submitInterview: send to FastAPI
      await fetch(
        process.env.PROCESSING_WORKER_URL ||
          'https://jethrob123-processing-worker.hf.space/process-interview',
        {
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
          }),
        },
      );

      return { success: true };
    } catch (error) {
      console.error('Error during reprocessing interview:', error);
      return { success: false, error: error.message };
    }
  }
}
