import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateCandidatesDto } from './dto/create-candidates.dto';
import { UpdateCandidatesDto } from './dto/update-candidates.dto';

@Injectable()
export class CandidatesService {
  private readonly logger = new Logger(CandidatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, createDto: CreateCandidatesDto) {
    try {
      return await this.prisma.candidate.create({
        data: {
          ...createDto,
          companyId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create candidates', error);
      throw new InternalServerErrorException('Failed to create candidates');
    }
  }

  async findAll(companyId: string) {
    try {
      return await this.prisma.candidate.findMany({
        where: {
          companyId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to get candidates', error);
      throw new InternalServerErrorException('Failed to get candidates');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.candidate.findUnique({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to get candidates', error);
      throw new InternalServerErrorException('Failed to get candidates');
    }
  }

  async update(id: string, updateDto: UpdateCandidatesDto) {
    try {
      return await this.prisma.candidate.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      this.logger.error('Failed to update candidates', error);
      throw new InternalServerErrorException('Failed to update candidates');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.candidate.delete({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to delete candidates', error);
      throw new InternalServerErrorException('Failed to delete candidates');
    }
  }
}
