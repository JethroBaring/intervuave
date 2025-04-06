import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateTemplatesDto } from './dto/create-templates.dto';
import { UpdateTemplatesDto } from './dto/update-templates.dto';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateTemplatesDto) {
    try {
      const { name, companyId, questions, metrics } = createDto;

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
}
