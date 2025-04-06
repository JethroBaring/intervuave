import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Body,
  Delete,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidatesDto } from './dto/create-candidates.dto';
import { UpdateCandidatesDto } from './dto/update-candidates.dto';

@Controller({ path: 'companies/:companyId/candidates', version: '1' })
export class CandidatesController {
  constructor(private readonly service: CandidatesService) {}

  @Post() create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateCandidatesDto,
  ) {
    return this.service.create(companyId, dto);
  }

  @Get() findAll(@Param('companyId') companyId: string) {
    return this.service.findAll(companyId);
  }

  @Get(':candidateId') findOne(@Param('candidateId') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':candidateId') update(
    @Param('candidateId') id: string,
    @Body() dto: UpdateCandidatesDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':candidateId') remove(@Param('candidateId') id: string) {
    return this.service.remove(id);
  }
}
