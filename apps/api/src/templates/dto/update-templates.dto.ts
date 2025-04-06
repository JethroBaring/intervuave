import { PartialType } from '@nestjs/swagger';
import { CreateTemplatesDto } from './create-templates.dto';

export class UpdateTemplatesDto extends PartialType(CreateTemplatesDto) {}
