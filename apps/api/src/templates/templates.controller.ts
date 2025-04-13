import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Body,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplatesDto } from './dto/create-templates.dto';
import { UpdateTemplatesDto } from './dto/update-templates.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller({ path: 'templates', version: '1' })
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Post('company/:companyId')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateTemplatesDto,
  ) {
    return this.service.create({ ...dto, companyId });
  }

  @Get('company/:companyId')
  @UseGuards(JwtAuthGuard)
  findAll(@Param('companyId') companyId: string) {
    return this.service.findAll(companyId);
  }

  @Get(':templateId')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('templateId') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':templateId')
  @UseGuards(JwtAuthGuard)
  update(@Param('templateId') id: string, @Body() dto: UpdateTemplatesDto) {
    return this.service.update(id, dto);
  }

  @Delete(':templateId')
  @UseGuards(JwtAuthGuard)
  emove(@Param('templateId') id: string) {
    return this.service.remove(id);
  }
}
