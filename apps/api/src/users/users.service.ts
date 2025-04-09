/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'nestjs-prisma';
import { hash } from 'bcryptjs';
import isPrismaError from 'src/utils/isPrimsaError';
import { UserType } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, companyName } = createUserDto;
    try {
      const company = await this.prismaService.company.findUnique({
        where: { name: companyName },
      });
      if (company) {
        throw new ConflictException('Company already exists');
      }

      const user = await this.prismaService.user.create({
        data: {
          email,
          password: await hash(password, 10),
          role: UserType.COMPANY,
          company: {
            create: {
              name: companyName,
            },
          },
        },
        select: {
          id: true,
          email: true,
          role: true,
          company: true,
        },
      });

      return user;
    } catch (error: any) {
      if (isPrismaError(error) && error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }

      this.logger.error('Failed to create user', error);
      throw new ConflictException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.prismaService.user.findMany();
    } catch (error) {
      this.logger.error('Error in findAll method', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          refreshToken: true,
          company: {
            select: {
              id: true,
            },
          },
        },
      });

      const result = {
        ...user,
        companyId: user?.company?.id ?? null,
      };

      if (!result) throw new NotFoundException('User not found');

      return result;
    } catch (error) {
      this.logger.error(`Error in findOne method`, error);
      throw new InternalServerErrorException('Failed to find user');
    }
  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      this.logger.error(`Error in findOne method`, error);
      throw new InternalServerErrorException('Failed to find user');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.prismaService.user.update({
        data: updateUserDto,
        where: { id },
      });
    } catch (error) {
      this.logger.error('Error in update method', error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: string) {
    try {
      await this.prismaService.user.delete({
        where: { id },
      });

      return { message: 'User successfully removed' };
    } catch (error) {
      this.logger.error('Error in remove method', error);
      throw new InternalServerErrorException('Failed to remove user');
    }
  }
}
