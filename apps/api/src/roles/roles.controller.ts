import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Body,
  Delete,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolesDto } from './dto/create-roles.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';

@Controller({ path: 'companies/:companyId/roles', version: '1' })
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Post() create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateRolesDto,
  ) {
    return this.service.create(companyId, dto);
  }

  @Get() findAll(@Param('companyId') companyId: string) {
    return this.service.findAll(companyId);
  }

  @Get(':roleId') findOne(@Param('roleId') roleId: string) {
    return this.service.findOne(roleId);
  }

  @Patch(':roleId') update(
    @Param('companyId') companyId: string,
    @Param('roleId') roleId: string,
    @Body() dto: UpdateRolesDto,
  ) {
    return this.service.update(companyId, roleId, dto);
  }

  @Delete(':roleId') remove(
    @Param('companyId') companyId: string,
    @Param('roleId') roleId: string,
  ) {
    console.log({ roleId, companyId });
    return this.service.remove(companyId, roleId);
  }
}
