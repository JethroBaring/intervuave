import { PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-companies.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
