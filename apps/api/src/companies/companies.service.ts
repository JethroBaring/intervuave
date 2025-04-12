import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateCompanyDto } from './dto/create-companies.dto';
import { UpdateCompanyDto } from './dto/update-companies.dto';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateCompanyDto) {
    try {
      return await this.prisma.company.create({
        data: {
          name: createDto.name,
          ownerId: createDto.ownerId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create companies', error);
      throw new InternalServerErrorException('Failed to create companies');
    }
  }

  async findAll() {
    try {
      return await this.prisma.company.findMany();
    } catch (error) {
      this.logger.error('Failed to get companies', error);
      throw new InternalServerErrorException('Failed to get companies');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.company.findUnique({
        where: { id },
        include: {
          coreValues: true,
          interviewTemplates: {
            include: {
              metrics: true,
              questions: true,
            },
          },
          candidates: true,
          interviews: {
            include: {
              candidate: true,
              responses: {
                include: {
                  question: true,
                },
              },
              evaluation: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error('Failed to get companies', error);
      throw new InternalServerErrorException('Failed to get companies');
    }
  }

  async update(id: string, updateDto: UpdateCompanyDto) {
    try {
      return await this.prisma.company.update({
        where: { id },
        data: {
          ...(updateDto.mission && { mission: updateDto.mission }),
          ...(updateDto.vision && { vision: updateDto.vision }),
          ...(updateDto.culture && { culture: updateDto.culture }),
          ...(updateDto.coreValues && {
            coreValues: {
              deleteMany: {},
              create: updateDto.coreValues,
            },
          }),
        },
        include: {
          coreValues: true,
        },
      });
    } catch (error) {
      this.logger.error('Failed to update companies', error);
      throw new InternalServerErrorException('Failed to update companies');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.company.delete({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to delete companies', error);
      throw new InternalServerErrorException('Failed to delete companies');
    }
  }
}
