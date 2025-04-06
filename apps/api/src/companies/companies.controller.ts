import { Controller, Get, Param, Body, Patch, Delete } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-companies.dto';

@Controller({ path: 'companies', version: '1' })
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @Get() findAll() {
    return this.service.findAll();
  }

  @Get(':companyId') findOne(@Param('companyId') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':companyId') update(
    @Param('companyId') id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':companyId') remove(@Param('companyId') id: string) {
    return this.service.remove(id);
  }
}
