import { PartialType } from '@nestjs/swagger';
import { CreateEvaluationsDto } from './create-evaluations.dto';

export class UpdateEvaluationsDto extends PartialType(CreateEvaluationsDto) {}
