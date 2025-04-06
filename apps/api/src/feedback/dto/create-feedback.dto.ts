export class CreateFeedbackDto {
  evaluationId: string;
  agreement: 'AGREE' | 'DISAGREE';
  comment?: string;
}
