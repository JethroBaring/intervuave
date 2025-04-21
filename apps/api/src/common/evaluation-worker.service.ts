import { forwardRef, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EvaluationsService } from 'src/evaluations/evaluations.service';
import getPrismaDateTimeNow from "src/utils/prismaDateTime";
import { CulturalFitEvaluation, GeminiService } from "./google-gemini.service";
import { Decision } from "@prisma/client";

interface ResponseItem {
  questionId: string;
  questionText: string;
  transcript: string;
  coreValues: string[];
  alignsWith: 'MISSION' | 'VISION' | 'CULTURE' | null;
}


@Injectable()
export class EvaluationWorkerService {
  private readonly logger = new Logger(EvaluationWorkerService.name);
  private isExecuting = false;
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
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
  
        await this.evaluate(task.interviewId, taskId);
  
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

  async evaluate(interviewId: string, taskId: string) {
    try {
      this.logger.log(`Evaluating interview ${interviewId}`);
      // Fetch interview data as you do now
      const interview = await this.prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
          responses: {
            take: 10,
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

      if (!interview) {
        throw new Error(`Interview with ID ${interviewId} not found`);
      }

      // Prepare the data as before
      const responses: ResponseItem[] = interview?.responses.map(
        (response) => ({
          questionId: response.questionId,
          questionText: response.question.questionText,
          transcript: response.transcript,
          coreValues: response.question.coreValues.split(','),
          alignsWith: response.question.alignedWith,
        }),
      );

      const companyProfile = {
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
      };

      await this.updateTaskStatus(taskId, 'EVALUATING');

      // Create chunks with explicit typing and array method instead of push
      const CHUNK_SIZE = 5; // Process 3 responses at a time

      // Create chunks using Array.from
      const chunks: ResponseItem[][] = Array.from(
        { length: Math.ceil(responses.length / CHUNK_SIZE) },
        (_, i) => responses.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
      );

      // Process each chunk
      const chunkResults: CulturalFitEvaluation[] = [];
      for (let i = 0; i < chunks.length; i++) {
        this.logger.log(`Processing chunk ${i + 1} of ${chunks.length}`);

        const chunkData = {
          responses: chunks[i],
          companyProfile: companyProfile,
        };

        // Evaluate this chunk
        this.logger.log(`Chunk data: ${JSON.stringify(chunkData)}`);
        const chunkEvaluation = await this.gemini.evaluateWithGemini(chunkData);

        if (!chunkEvaluation) {
          this.logger.error(`Chunk ${i + 1} evaluation failed, skipping`);
          continue;
        }

        chunkResults.push(chunkEvaluation);
      }

      // Combine results from all chunks
      const combinedEvaluation = this.combineChunkResults(chunkResults);

      if (
        !combinedEvaluation ||
        !combinedEvaluation.perQuestionResults ||
        combinedEvaluation.perQuestionResults.length === 0
      ) {
        throw new Error('All chunk evaluations failed.');
      }

      // Proceed with self-critique using the combined results
      const correctedEvaluation =
        await this.gemini.selfCritique(combinedEvaluation);

      if (!correctedEvaluation) {
        throw new Error('Self-critique failed.');
      }

      // Calculate scores and save as before
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

      await this.updateTaskStatus(taskId, 'EVALUATED');

      return { message: 'success' };
    } catch (error) {
      this.logger.error('Failed to evaluate interview', error);
      await this.updateTaskStatus(
        taskId,
        'FAILED_EVALUATION',
      );
      throw new InternalServerErrorException('Failed to evaluate interview');
    }
  }

  // Add this helper method to combine results from chunks
  private combineChunkResults(
    chunkResults: CulturalFitEvaluation[],
  ): CulturalFitEvaluation {
    // Initialize with empty array for results
    const combined: CulturalFitEvaluation = {
      perQuestionResults: [],
    };

    // Merge all perQuestionResults from each chunk
    chunkResults.forEach((result) => {
      if (
        result &&
        result.perQuestionResults &&
        Array.isArray(result.perQuestionResults)
      ) {
        // Use type assertion to help TypeScript understand this is an array
        const resultArray = result.perQuestionResults as Array<{
          questionId: string;
          cultureFitComposite?: {
            valuesFit?: Array<{
              coreValue: string;
              score: number;
            }>;
            missionAlignment?: number;
            visionAlignment?: number;
            cultureFit?: number;
          };
          feedback?: string;
        }>;

        // Now TypeScript knows this is an array
        combined.perQuestionResults = [
          ...(combined.perQuestionResults || []),
          ...resultArray,
        ];
      }
    });

    return combined;
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
            missionWeight: true,
            visionWeight: true,
            coreValuesWeight: true,
            cultureWeight: true,
          },
          // include: {
          //   metrics: true,
          // },
        },
      },
    });

    if (!interview) {
      throw new Error('Interview not found.');
    }
    const { responses, interviewTemplate } = interview;
    const responseQualityWeight = interviewTemplate.responseQualityWeight ?? 30;
    const cultureFitWeight = interviewTemplate.cultureFitWeight ?? 70;
    const missionWeight = interviewTemplate.missionWeight ?? 30;
    const visionWeight = interviewTemplate.visionWeight ?? 30;
    const coreValuesWeight = interviewTemplate.coreValuesWeight ?? 30;
    const cultureWeight = interviewTemplate.cultureWeight ?? 40;
    const confidenceWeight = 20;
    const speechClarityWeight = 20;
    const emotionalToneWeight = 20;
    const engagementWeight = 20;
    const bodyLanguageWeight = 20;
    // const confidenceWeight =
    //   interviewTemplate.metrics.find((metric) => metric.name === 'Confidence')
    //     ?.weight ?? 20;
    // const speechClarityWeight =
    //   interviewTemplate.metrics.find(
    //     (metric) => metric.name === 'Speech Clarity',
    //   )?.weight ?? 20;
    // const emotionalToneWeight =
    //   interviewTemplate.metrics.find(
    //     (metric) => metric.name === 'Emotional Tone',
    //   )?.weight ?? 20;
    // const engagementWeight =
    //   interviewTemplate.metrics.find((metric) => metric.name === 'Engagement')
    //     ?.weight ?? 20;
    // const bodyLanguageWeight =
    //   interviewTemplate.metrics.find(
    //     (metric) => metric.name === 'Body Language',
    //   )?.weight ?? 20;

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
      (avgSpeechClarity * speechClarityWeight +
        avgConfidence * confidenceWeight +
        avgEmotionalTone * emotionalToneWeight +
        avgEngagement * engagementWeight +
        avgBodyLanguage * bodyLanguageWeight) /
      (speechClarityWeight +
        confidenceWeight +
        emotionalToneWeight +
        engagementWeight +
        bodyLanguageWeight);
    const cultureScores = [
      avgValuesFit * coreValuesWeight,
      avgMissionAlignment * missionWeight,
      avgVisionAlignment * visionWeight,
      avgCultureFit * cultureWeight,
    ];
    const nonZeroCultureScores = cultureScores.filter((score) => score > 0);
    const nonZeroWeights: number[] = [];
    if (cultureScores[0] > 0) nonZeroWeights.push(coreValuesWeight);
    if (cultureScores[1] > 0) nonZeroWeights.push(missionWeight);
    if (cultureScores[2] > 0) nonZeroWeights.push(visionWeight);
    if (cultureScores[3] > 0) nonZeroWeights.push(cultureWeight);
    const avgCultureFitComposite =
      nonZeroCultureScores.length > 0
        ? nonZeroCultureScores.reduce((sum, score) => sum + score, 0) /
          nonZeroWeights.reduce((sum, weight) => sum + weight, 0)
        : 0;

    const overallFitScore =
      (avgResponseQuality * responseQualityWeight +
        avgCultureFitComposite * cultureFitWeight) /
      (responseQualityWeight + cultureFitWeight);
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
}
