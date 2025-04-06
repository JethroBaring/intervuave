import { CreateCandidatesDto } from 'src/candidates/dto/create-candidates.dto';

export type InputType = 'BUILT_IN' | 'EXTERNAL';
export type DeviceType = 'LAPTOP' | 'DESKTOP' | 'MOBILE' | 'TABLET';
export type InterviewStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PROCESSING'
  | 'EVALUATED'
  | 'EXPIRED';

export class CreateInterviewsDto {
  candidate: CreateCandidatesDto;
  position: string;
  interviewTemplateId: string;
  interviewLink?: string;
  expiresAt?: any; // ISO string format (Date)
  timestamps?: any;
  videoUrl?: string;
  cameraType?: InputType;
  micType?: InputType;
  deviceType?: DeviceType;
  noiseLevel?: number;
  status: InterviewStatus;
}
