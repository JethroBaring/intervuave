import { PartialType } from '@nestjs/swagger';
import { CreateCoreValueDto } from './create-core-values.dto';

export class UpdateCoreValueDto extends PartialType(CreateCoreValueDto) {}
