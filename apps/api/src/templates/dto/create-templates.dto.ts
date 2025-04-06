export class CreateQuestionDto {
  questionText: string;
  alignedWith?: 'MISSION' | 'VISION' | 'CULTURE';
  order: number;
  templateId: string;
  evaluates: string;
  coreValueId?: string;
}

export class CreateMetricDto {
  name: string;
  description: string;
  weight?: number;
}

export class CreateTemplatesDto {
  name: string;
  companyId: string;
  questions: CreateQuestionDto[];
  metrics: CreateMetricDto[];
}
