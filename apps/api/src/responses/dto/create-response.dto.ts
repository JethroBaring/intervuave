export class ResponseItemDto {
  questionId: string;
  transcript: string;
  start: number;
  end: number;
  duration: number;
  wordTimings: any;
  emotionTimeline: any;
  postureTimeline: any;
  gazeTimeline: any;
  pauseLocations: any;
  disfluencies: any;
  expressivenessTimeline: any;
  expressiveness: number;
  emotion: string;
  eyeGaze: number;
  posture: number;
  gestures: number;
  movement: number;
  speechFeatures: any;
  metrics: any;
  metricsConfidence: any;
  processingVersion: string;
  qualityFlag: string;
}

export class CreateResponsesDto {
  responses: ResponseItemDto[];
}
