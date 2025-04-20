import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateTemplatesDto } from './dto/create-templates.dto';
import { UpdateTemplatesDto } from './dto/update-templates.dto';
import { GeminiService } from '../common/google-gemini.service';

export enum AlignmentTag {
  MISSION = 'mission',
  VISION = 'vision',
  CULTURE = 'culture',
}

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  async create(createDto: CreateTemplatesDto) {
    try {
      const {
        name,
        companyId,
        questions,
        metrics,
        responseQualityWeight,
        cultureFitWeight,
      } = createDto;

      return await this.prisma.interviewTemplate.create({
        data: {
          name,
          companyId,
          questions: {
            create: questions,
          },
          metrics: {
            create: metrics,
          },
          responseQualityWeight,
          cultureFitWeight,
        },
        include: { questions: true, metrics: true },
      });
    } catch (error) {
      this.logger.error('Failed to create templates', error);
      throw new InternalServerErrorException('Failed to create templates');
    }
  }

  async findAll(companyId: string) {
    try {
      return await this.prisma.interviewTemplate.findMany({
        where: {
          companyId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to get templates', error);
      throw new InternalServerErrorException('Failed to get templates');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.interviewTemplate.findUnique({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to get templates', error);
      throw new InternalServerErrorException('Failed to get templates');
    }
  }

  async update(id: string, updateDto: UpdateTemplatesDto) {
    try {
      const { name, questions, metrics } = updateDto;

      return await this.prisma.interviewTemplate.update({
        where: { id },
        data: {
          name,
          questions: {
            deleteMany: {},
            create: questions,
          },
          metrics: {
            deleteMany: {},
            create: metrics,
          },
        },
        select: {
          id: true,
          name: true,
          questions: true,
          metrics: true,
        },
      });
    } catch (error) {
      this.logger.error('Failed to update templates', error);
      throw new InternalServerErrorException('Failed to update templates');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.interviewTemplate.delete({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to delete templates', error);
      throw new InternalServerErrorException('Failed to delete templates');
    }
  }

  async generateQuestions(companyId: string, numberOfQuestions: number) {
    try {
      // Get company profile
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
        select: {
          coreValues: true,
          mission: true,
          vision: true,
          culture: true,
        },
      });

      if (!company) {
        throw new InternalServerErrorException('Company not found');
      }

      // Ensure required fields are present
      if (!company.mission || !company.vision || !company.coreValues) {
        throw new InternalServerErrorException('Company profile is incomplete');
      }

      // Convert coreValues to the expected format
      const coreValuesRecord = company.coreValues.reduce((acc, cv) => {
        acc[cv.name] = cv.description;
        return acc;
      }, {} as Record<string, string>);

      // Generate questions using Gemini
      const generatedQuestions = await this.geminiService.generateTemplateQuestions({
        coreValues: coreValuesRecord,
        mission: company.mission,
        vision: company.vision,
        culture: company.culture || '',
      }, numberOfQuestions);

      if (!generatedQuestions) {
        throw new InternalServerErrorException('Failed to generate questions');
      }

      // Format questions according to Question model
      const formattedQuestions = generatedQuestions.map((q, index) => ({
        questionText: q.text,
        alignedWith: q.type as AlignmentTag,
        order: index + 1,
        coreValues: q.coreValues.join(','),
      }));

      return formattedQuestions;
    } catch (error) {
      this.logger.error('Failed to generate questions', error);
      throw new InternalServerErrorException('Failed to generate questions');
    }
  }
}
