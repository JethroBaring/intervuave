import { PartialType } from '@nestjs/swagger';
import { CreateCandidatesDto } from './create-candidates.dto';

export class UpdateCandidatesDto extends PartialType(CreateCandidatesDto) {}
