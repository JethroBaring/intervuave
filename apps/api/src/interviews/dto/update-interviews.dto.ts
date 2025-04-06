import { PartialType } from '@nestjs/swagger';
import { CreateInterviewsDto } from './create-interviews.dto';

export class UpdateInterviewsDto extends PartialType(CreateInterviewsDto) {}
