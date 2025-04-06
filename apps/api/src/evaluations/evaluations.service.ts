import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateEvaluationsDto } from './dto/create-evaluations.dto';
import { UpdateEvaluationsDto } from './dto/update-evaluations.dto';

@Injectable()
export class EvaluationsService {
  private readonly logger = new Logger(EvaluationsService.name);

  constructor(private readonly prisma: PrismaService) {}

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
}
