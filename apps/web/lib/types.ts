export interface Question {
  id?: string;
  questionText: string;
  order?: number;
  evaluates: string;
  coreValueId?: string;
  alignedWith: string;
}

export interface Metric {
  id?: string;
  name: string;
  description: string;
  weight: number;
}

export interface Role {
  id?: string;
  title: string;
  companyId?: string;
  interviewTemplateId: string;
}

export interface Candidate {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  interviews?: Interview[];
}

export interface InterviewTemplate {
  id?: string;
  name: string;
  companyId?: string;
  questions?: Question[];
  metrics?: Metric[];
  roles?: Role[];
}

export interface CoreValue {
  id?: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  refreshToken: string;
  role: UserRole;
}

export interface Response {
  id: string;
  interviewId: string;
  questionId: string;
  transcriptWeb: string;
  transcriptWhisper: string;
  finalTranscript: string;
  startTime: number;
  endTime: number;
  videoChunkUrl: string;
  emotion: string;
  tone: string;
  eyeGaze: string;
  posture: string;
  metrics: object;
}

export interface Evaluation {
  id: string;
  interviewId: string;
  valuesFit: number;
  responseQuality: number;
  missionAlignment: number;
  visionAlignment: number;
  cultureFit: number;
  overallFitScore: number;
  perQuestionResult: object;
  perValueBreakdown: object;
}

export interface Interview {
  id: string;
  candidateId: string;
  positionId: string;
  interviewLink: string;
  expiresAt: string; // assuming ISO string from backend
  videoUrl: string;
  cameraType: InputType;
  micType: InputType;
  noiseLevel?: number | null;
  deviceType: DeviceType;
  candidate: Candidate;
  position: Role;
  responses: Response[];
  evaluation?: Evaluation | null;
  status: InterviewStatus;
  aiDecision?: Decision | null;
  finalDecision?: Decision | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

enum MessageTypeEnum {
  TRANSCRIPT = "transcript",
  FUNCTION_CALL = "function-call",
  FUNCTION_CALL_RESULT = "function-call-result",
  ADD_MESSAGE = "add-message",
}

enum MessageRoleEnum {
  USER = "user",
  SYSTEM = "system",
  ASSISTANT = "assistant",
}

enum TranscriptMessageTypeEnum {
  PARTIAL = "partial",
  FINAL = "final",
}

interface BaseMessage {
  type: MessageTypeEnum;
}

interface TranscriptMessage extends BaseMessage {
  type: MessageTypeEnum.TRANSCRIPT;
  role: MessageRoleEnum;
  transcriptType: TranscriptMessageTypeEnum;
  transcript: string;
}

interface FunctionCallMessage extends BaseMessage {
  type: MessageTypeEnum.FUNCTION_CALL;
  functionCall: {
    name: string;
    parameters: unknown;
  };
}

interface FunctionCallResultMessage extends BaseMessage {
  type: MessageTypeEnum.FUNCTION_CALL_RESULT;
  functionCallResult: {
    forwardToClientEnabled?: boolean;
    result: unknown;
    [a: string]: unknown;
  };
}

export type Message =
  | TranscriptMessage
  | FunctionCallMessage
  | FunctionCallResultMessage;

export enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}


export enum InterviewStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  PROCESSING = "PROCESSING",
  EVALUATED = "EVALUATED",
  EXPIRED = "EXPIRED",
}

export enum DeviceType {
  LAPTOP = "LAPTOP",
  DESKTOP = "DESKTOP",
  MOBILE = "MOBILE",
  TABLET = "TABLET",
}

export enum InputType {
  BUILT_IN = "BUILT_IN",
  EXTERNAL = "EXTERNAL",
}

export enum Decision {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

enum UserRole {
  ADMIN = "ADMIN",
  COMPANY = "COMPANY",
}
