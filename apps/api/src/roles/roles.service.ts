import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateRolesDto } from './dto/create-roles.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, createDto: CreateRolesDto) {
    try {
      return await this.prisma.role.create({
        data: {
          ...createDto,
          companyId,
        },
        include: {
          interviewTemplate: true,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create roles', error);
      throw new InternalServerErrorException('Failed to create roles');
    }
  }

  async findAll(companyId: string) {
    try {
      return await this.prisma.role.findMany({
        where: {
          companyId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to get roles', error);
      throw new InternalServerErrorException('Failed to get roles');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.role.findUnique({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to get roles', error);
      throw new InternalServerErrorException('Failed to get roles');
    }
  }

  async update(companyId: string, roleId: string, updateDto: UpdateRolesDto) {
    try {
      return await this.prisma.role.update({
        where: { id: roleId, companyId },
        data: updateDto,
        include: {
          interviewTemplate: true,
        },
      });
    } catch (error) {
      this.logger.error('Failed to update roles', error);
      throw new InternalServerErrorException('Failed to update roles');
    }
  }

  async remove(companyId: string, roleId: string) {
    try {
      return await this.prisma.role.delete({
        where: { id: roleId, companyId },
      });
    } catch (error) {
      this.logger.error('Failed to delete roles', error);
      throw new InternalServerErrorException('Failed to delete roles');
    }
  }
}
