import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateCoreValueDto } from './dto/create-core-values.dto';
import { UpdateCoreValueDto } from './dto/update-core-values.dto';

@Injectable()
export class CoreValuesService {
  private readonly logger = new Logger(CoreValuesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, createDto: CreateCoreValueDto) {
    try {
      return await this.prisma.coreValue.create({
        data: {
          ...createDto,
          companyId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create core-values', error);
      throw new InternalServerErrorException('Failed to create core-values');
    }
  }

  async findAll(companyId: string) {
    try {
      return await this.prisma.coreValue.findMany({ where: { companyId } });
    } catch (error) {
      this.logger.error('Failed to get core-values', error);
      throw new InternalServerErrorException('Failed to get core-values');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.coreValue.findUnique({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to get core-values', error);
      throw new InternalServerErrorException('Failed to get core-values');
    }
  }

  async update(companyId: string, id: string, updateDto: UpdateCoreValueDto) {
    try {
      return await this.prisma.coreValue.update({
        where: { id, companyId },
        data: updateDto,
      });
    } catch (error) {
      this.logger.error('Failed to update core-values', error);
      throw new InternalServerErrorException('Failed to update core-values');
    }
  }

  async remove(companyId: string, id: string) {
    try {
      return await this.prisma.coreValue.delete({ where: { id, companyId } });
    } catch (error) {
      this.logger.error('Failed to delete core-values', error);
      throw new InternalServerErrorException('Failed to delete core-values');
    }
  }
}
