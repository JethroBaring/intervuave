import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Body,
  Delete,
} from '@nestjs/common';
import { CoreValuesService } from './core-values.service';
import { CreateCoreValueDto } from './dto/create-core-values.dto';
import { UpdateCoreValueDto } from './dto/update-core-values.dto';

@Controller({ path: 'companies/:companyId/core-values', version: '1' })
export class CoreValuesController {
  constructor(private readonly service: CoreValuesService) {}

  @Post() create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateCoreValueDto,
  ) {
    return this.service.create(companyId, dto);
  }

  @Get() findAll(@Param('companyId') companyId: string) {
    return this.service.findAll(companyId);
  }

  @Patch(':valueId') update(
    @Param('companyId') companyId: string,
    @Param('valueId') valueId: string,
    @Body() dto: UpdateCoreValueDto,
  ) {
    return this.service.update(companyId, valueId, dto);
  }

  @Delete(':valueId') remove(
    @Param('companyId') companyId: string,
    @Param('valueId') valueId: string,
  ) {
    return this.service.remove(companyId, valueId);
  }
}
