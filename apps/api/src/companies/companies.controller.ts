import {
  Controller,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-companies.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller({ path: 'companies', version: '1' })
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.service.findAll();
  }

  @Get(':companyId')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('companyId') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':companyId')
  @UseGuards(JwtAuthGuard)
  update(@Param('companyId') id: string, @Body() dto: UpdateCompanyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':companyId')
  @UseGuards(JwtAuthGuard)
  remove(@Param('companyId') id: string) {
    return this.service.remove(id);
  }
}
