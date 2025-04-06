export type Decision = 'APPROVED' | 'REJECTED';

export class CreateEvaluationsDto {
  interviewId: string;

  positionFit: number;
  valuesFit: number;
  missionAlignment: number;
  visionAlignment: number;
  cultureFit: number;
  overallFitScore: number;

  speechClarity: number;
  confidence: number;
  emotionalTone: number;
  engagement: number;
  bodyLanguage: number;

  perQuestionResults: any; // Replace with a more specific type if structured
  perValueBreakdown: any; // Same here

  aiDecision?: Decision;
}
