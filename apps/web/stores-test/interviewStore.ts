import { create } from "zustand";
import api from "@/lib/axios";
import { endpoints } from "@/lib/endpoint";
import { Candidate, Question } from "@/lib/types";

interface Transcript {
  message: string;
  time: number;
  sender: "bot" | "user";
}

interface QuestionTimestamp {
  questionId: string;
  start: number;
  end: number;
}

interface InterviewState {
  videoBlob: Blob | null;
  setVideoBlob: (blob: Blob) => void;
  timestamps: QuestionTimestamp[];
  transcripts: Transcript[];
  isCameraOn: boolean;
  isRecording: boolean;
  expectingUserInput: boolean;
  currentQuestionIndex: number;
  userResponseResolver: (() => void) | null;
  startInterview: () => void;
  stopInterview: () => void;
  nextQuestion: () => void;
  toggleCamera: () => Promise<void>;
  setVideoRef: (ref: React.RefObject<HTMLVideoElement | null>) => void;
  addQuestionTimestamp: (questionId: string) => void;
  addTranscript: (message: string, sender: "bot" | "user") => void;
  endCurrentQuestion: () => void;
  startRecording: () => void;
  stopRecording: () => void;

  interview: any | null;
  questions: Question[];
  candidate: Candidate | null;
  role: string;
  isValid: boolean;
  isExpired: boolean;
  isVerifying: boolean;
  recordingStartTime: number | null;
  setRecordingStartTime: (time: number) => void;
  verifyToken: (token: string) => Promise<void>;
}

let videoRef: React.RefObject<HTMLVideoElement | null> | null = null;
let streamRef: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

export const useInterviewStore = create<InterviewState>((set, get) => ({
  recordingStartTime: null,
  setRecordingStartTime: (time) => set({ recordingStartTime: time }),
  videoBlob: null,
  setVideoBlob: (blob) => set({ videoBlob: blob }),
  timestamps: [],
  transcripts: [],
  isCameraOn: false,
  isRecording: false,
  expectingUserInput: false,
  currentQuestionIndex: 0,
  userResponseResolver: null,

  setVideoRef: (ref) => {
    videoRef = ref;
  },

  toggleCamera: async () => {
    const { isCameraOn } = get();
    if (isCameraOn) {
      streamRef?.getTracks().forEach((track) => track.stop());
      streamRef = null;
      set({ isCameraOn: false });
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef?.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef = stream;
        set({ isCameraOn: true });
      }
    }
  },

  startRecording: () => {
    if (!videoRef?.current || get().isRecording) return;
    const stream = videoRef.current.srcObject as MediaStream;
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      set({ videoBlob: blob });
    };
    mediaRecorder.start();
    set({
      isRecording: true,
      recordingStartTime: performance.now(),
    });
  },

  stopRecording: () => {
    if (mediaRecorder && get().isRecording) {
      mediaRecorder.stop();
      set({ isRecording: false });
    }
  },

  startInterview: () => {
    set({ currentQuestionIndex: 0, timestamps: [] });
  },

  nextQuestion: () => {
    const {
      questions,
      currentQuestionIndex,
      addQuestionTimestamp,
      addTranscript,
      stopInterview,
    } = get();
    if (currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex];
      addQuestionTimestamp(question.id!);
      addTranscript(question.questionText, "bot");
      set({
        expectingUserInput: true,
        currentQuestionIndex: currentQuestionIndex + 1,
      });
    } else {
      stopInterview();
    }
  },

  stopInterview: () => {
    if (get().isRecording) {
      get().stopRecording();
    }
    set({ isRecording: false, expectingUserInput: false });
  },

  addQuestionTimestamp: (questionId: string) =>
    set((state) => {
      const now = performance.now();
      const relativeStart = state.recordingStartTime
        ? now - state.recordingStartTime
        : 0;
      return {
        timestamps: [
          ...state.timestamps,
          { questionId, start: Math.round(relativeStart), end: 0 },
        ],
      };
    }),

  endCurrentQuestion: () => {
    set((state) => {
      const now = performance.now();
      const lastIndex = state.timestamps.length - 1;
      if (lastIndex >= 0 && state.recordingStartTime !== null) {
        state.timestamps[lastIndex].end = Math.round(
          now - state.recordingStartTime
        );
      }
      return { expectingUserInput: false };
    });
  },

  addTranscript: (message, sender) =>
    set((state) => ({
      transcripts: [
        ...state.transcripts,
        { message, time: Date.now(), sender },
      ],
    })),

  interview: null,
  isValid: false,
  isExpired: false,
  isVerifying: false,
  candidate: null,
  questions: [],
  role: "",

  verifyToken: async (token) => {
    set({ isVerifying: true });
    try {
      const { data } = await api.get(
        `${endpoints.public.accessInterview(encodeURIComponent(token))}`
      );

      if (data.valid) {
        set({
          interview: data.interview,
          candidate: data.interview.candidate,
          questions: data.interview.role.interviewTemplate.questions,
          role: data.interview.role.title,
          isValid: true,
          isExpired: false,
          isVerifying: false,
        });
      } else {
        set({
          interview: null,
          isValid: false,
          isExpired: data.reason === "expired",
          isVerifying: false,
        });
      }
    } catch (err) {
      console.error(err);
      set({
        interview: null,
        isValid: false,
        isExpired: false,
        isVerifying: false,
      });
    }
  },
}));
