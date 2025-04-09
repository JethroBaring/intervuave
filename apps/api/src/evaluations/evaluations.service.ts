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

@Injectable()
export class EvaluationsService {
  private readonly logger = new Logger(EvaluationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
  ) {}

  async create(createDto: CreateEvaluationsDto) {
    try {
      return await this.prisma.evaluation.create({
        data: createDto,
      });
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
              include: {
                coreValues: true,
              },
              select: {
                alignedWith: true,
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
        coreValues: response.question.coreValues.map(
          (coreValue) => coreValue.name,
        ),
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
      data: {
        interviewId,
        ...calculatedEvaluation,
      },
    });

    await this.prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: 'EVALUATED',
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
            responseQualityWeights: true,
            cultureFitWeights: true,
          },
        },
      },
    });

    if (!interview) {
      throw new Error('Interview not found.');
    }

    const { responses, interviewTemplate } = interview;

    const responseQualityWeight =
      interviewTemplate.responseQualityWeights ?? 30;
    const cultureFitWeight = interviewTemplate.cultureFitWeights ?? 70;

    const metricsByQuestionId = new Map<string, any>();
    for (const response of responses) {
      metricsByQuestionId.set(response.questionId, response.metrics);
    }

    let totalResponseQualityScore = 0;
    let totalValuesFit = 0;
    let totalMissionAlignment = 0;
    let totalVisionAlignment = 0;
    let totalCultureFit = 0;
    let countValuesFit = 0;
    let countMissionAlignment = 0;
    let countVisionAlignment = 0;
    let countCultureFit = 0;
    let questionCount = 0;

    const perValueScores: Record<string, number[]> = {};

    for (const result of correctedEvaluation.perQuestionResults) {
      const metrics = metricsByQuestionId.get(result.questionId as string);
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

      const responseQualityScore =
        ((speechClarity ?? 0) +
          (confidence ?? 0) +
          (emotionalTone ?? 0) +
          (engagement ?? 0) +
          (bodyLanguage ?? 0)) /
        5;

      totalResponseQualityScore += responseQualityScore;
      questionCount++;

      // Culture Fit Scores
      const { cultureFitComposite } = result;

      if (Array.isArray(cultureFitComposite.valuesFit)) {
        for (const value of cultureFitComposite.valuesFit) {
          if (!perValueScores[value.coreValue]) {
            perValueScores[value.coreValue] = [];
          }
          perValueScores[value.coreValue].push(parseInt(value.score as string));
          totalValuesFit += value.score;
          countValuesFit++;
        }
      }

      if (cultureFitComposite.missionAlignment !== undefined) {
        totalMissionAlignment += cultureFitComposite.missionAlignment;
        countMissionAlignment++;
      }
      if (cultureFitComposite.visionAlignment !== undefined) {
        totalVisionAlignment += cultureFitComposite.visionAlignment;
        countVisionAlignment++;
      }
      if (cultureFitComposite.cultureFit !== undefined) {
        totalCultureFit += cultureFitComposite.cultureFit;
        countCultureFit++;
      }
    }

    if (questionCount === 0) {
      throw new Error('No valid questions found for scoring.');
    }

    const avgResponseQuality = totalResponseQualityScore / questionCount;
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

    const overallFitScore =
      avgResponseQuality * (responseQualityWeight / 100) +
      ((avgValuesFit +
        avgMissionAlignment +
        avgVisionAlignment +
        avgCultureFit) /
        4) *
        (cultureFitWeight / 100);

    const perValueBreakdown: Record<string, number> = {};
    for (const coreValue in perValueScores) {
      const scores = perValueScores[coreValue];
      perValueBreakdown[coreValue] =
        scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    return {
      responseQuality: avgResponseQuality,
      valuesFit: avgValuesFit,
      missionAlignment: avgMissionAlignment,
      visionAlignment: avgVisionAlignment,
      cultureFit: avgCultureFit,
      overallFitScore: overallFitScore,
      perQuestionResults: correctedEvaluation.perQuestionResults,
      perValueBreakdown: perValueBreakdown,
      aiDecision: null, // optional, if you have a rule to auto-approve/reject
      aiFeedback: '', // optional general feedback, can fill later
    };
  }
}
