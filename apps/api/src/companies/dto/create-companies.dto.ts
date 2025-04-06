import { CreateCoreValueDto } from 'src/core-values/dto/create-core-values.dto';

export class CreateCompanyDto {
  name: string;
  mission?: string;
  vision?: string;
  culture?: string;
  coreValues?: CreateCoreValueDto[];
  ownerId: string;
}
