import { create } from "zustand";
import { speak } from "@/lib/elevenlabs";
import { Candidate, Interview, Question } from "@/lib/types";
import { endpoints } from "@/lib/endpoint";
import api from "@/lib/axios";

interface QuestionTimestamp {
  questionId: string;
  questionText: string;
  start: number;
  end: number;
}

interface InterviewState {
  timestamps: QuestionTimestamp[];
  recordingStartTime: number | null;
  isRecording: boolean;
  isCameraOn: boolean;
  currentQuestionIndex: number;
  company: any;
  interviewToken: string | null;
  interview: Interview | null;
  questions: Question[];
  candidate: Candidate | null;
  role: string;
  isValid: boolean;
  isExpired: boolean;
  isVerifying: boolean;
  isSpeaking: boolean;
  isSubmitting: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  startInterview: () => Promise<void>;
  nextQuestion: () => Promise<void>;
  endCurrentQuestion: () => void;
  stopInterview: () => void;
  toggleCamera: () => Promise<void>;
  setVideoRef: (ref: React.RefObject<HTMLVideoElement | null>) => void;
  verifyToken: (token: string) => Promise<void>;
  getStreamRef: () => MediaStream | null;
}

let videoRef: React.RefObject<HTMLVideoElement | null> | null = null;
let streamRef: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

export const useInterviewerStore = create<InterviewState>((set, get) => ({
  timestamps: [],
  recordingStartTime: null,
  isRecording: false,
  isCameraOn: false,
  currentQuestionIndex: 0,
  questions: [],
  company: null,
  interviewToken: null,
  interview: null,
  isValid: false,
  isExpired: false,
  isVerifying: false,
  candidate: null,
  isSpeaking: false,
  isSubmitting: false,
  role: "",
  currentStep: 0,
  setCurrentStep: (step: number) => {
    set({ currentStep: step });
  },
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

  startInterview: async () => {
    if (get().isRecording || !videoRef?.current) return;

    await api.patch(
      `${endpoints.public.startInterview(
        encodeURIComponent(get().interviewToken!)
      )}`
    );

    // Start recording
    const stream = videoRef.current.srcObject as MediaStream;
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      try {
        // Upload video
        set({ isSubmitting: true });
        const videoFilename = `${Date.now()}_interview.webm`;
        const { data } = await api.post(
          `${endpoints.public.getSignedInterviewUrl(
            encodeURIComponent(get().interviewToken!)
          )}`,
          {
            filename: videoFilename,
            contentType: "video/webm",
            interviewId: get().interview?.id,
          }
        );

        if (!data) throw new Error("Failed to get signed URL for video");
        const uploadUrl = data.uploadUrl;

        const uploadVideo = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "video/webm" },
          body: blob,
        });
        if (!uploadVideo.ok) throw new Error("Video upload failed");
        await api.patch(
          `${endpoints.public.submitInterview(
            encodeURIComponent(get().interviewToken!)
          )}`,
          {
            timestamps: get().timestamps,
          }
        );
        set({ isSubmitting: false, currentStep: 5 });
      } catch (err) {
        console.error(err);
        alert("Upload failed");
      }
    };

    mediaRecorder.start();
    const startTime = performance.now();
    setTimeout(
      () => set({ isRecording: true, recordingStartTime: startTime }),
      500
    );
    await speak("Welcome to the interview. Let's begin.", (isSpeaking) =>
      set({ isSpeaking })
    );

    await get().nextQuestion();
  },

  nextQuestion: async () => {
    const { questions, currentQuestionIndex, timestamps, recordingStartTime } =
      get();

    if (currentQuestionIndex >= questions.length) return;

    const question = questions[currentQuestionIndex];

    await speak(question.questionText, (isSpeaking) => set({ isSpeaking })); // Speak first

    const now = performance.now();
    const relativeStart = recordingStartTime ? now - recordingStartTime : 0;

    timestamps.push({
      questionId: question.id!,
      questionText: question.questionText,
      start: Math.round(relativeStart),
      end: 0,
    });

    set({
      currentQuestionIndex: currentQuestionIndex + 1,
      timestamps,
    });
  },

  endCurrentQuestion: () => {
    const now = performance.now();
    const { timestamps, recordingStartTime } = get();
    if (timestamps.length > 0 && recordingStartTime !== null) {
      timestamps[timestamps.length - 1].end = Math.round(
        now - recordingStartTime
      );
    }
    set({ timestamps });
  },

  stopInterview: () => {
    get().endCurrentQuestion();
    if (mediaRecorder && get().isRecording) {
      mediaRecorder.stop();
    }

    if (streamRef) {
      streamRef.getTracks().forEach((track) => track.stop()); // 👈 stop the camera and microphone
      streamRef = null;
    }

    if (videoRef?.current) {
      videoRef.current.srcObject = null; // 👈 detach the stream from the video element
    }

    set({ isRecording: false, isCameraOn: false });
  },
  verifyToken: async (token: string) => {
    set({ isVerifying: true });
    try {
      const { data } = await api.get(
        `${endpoints.public.accessInterview(encodeURIComponent(token))}`
      );

      if (data.valid) {
        set({
          company: data.interview.company,
          interview: data.interview,
          candidate: data.interview.candidate,
          questions: data.interview.interviewTemplate.questions.slice(1, 2),
          role: data.interview.position,
          isValid: true,
          isExpired: false,
          isVerifying: false,
          interviewToken: token,
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
  getStreamRef: () => {
    return streamRef;
  },
}));
