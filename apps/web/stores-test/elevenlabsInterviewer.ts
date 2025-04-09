import { create } from "zustand";
import { speak } from "@/lib/elevenlabs";
import { Question } from "@/lib/types";

let videoRef: React.RefObject<HTMLVideoElement | null> | null = null;
let streamRef: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let recognition: SpeechRecognition | null = null;

interface Transcript {
  message: string;
  time: number;
  sender: "bot" | "user";
}

interface InterviewState {
  timestamps: { start: number; end: number }[];
  transcripts: Transcript[];
  isCameraOn: boolean;
  isRecording: boolean;
  expectingUserInput: boolean;
  userResponseResolver: (() => void) | null;
  questions: Question[];
  startInterview: () => Promise<void>;
  stopInterview: () => void;
  toggleCamera: () => Promise<void>;
  setVideoRef: (ref: React.RefObject<HTMLVideoElement | null>) => void;
  addQuestionTimestamp: () => void;
  addTranscript: (message: string, sender: "bot" | "user") => void;
  endCurrentQuestion: (userTranscript: string) => void;
}

export const useElevenlabsInterviewerStore = create<InterviewState>((set, get) => ({
  timestamps: [],
  transcripts: [],
  isCameraOn: false,
  isRecording: false,
  expectingUserInput: false,
  userResponseResolver: null,
  questions: [
    {
      questionText: "Can you tell me about a time when you had to explain a complex idea to someone?",
      evaluates: "communication",
      alignedWith: "clarity",
    },
    {
      questionText: "Describe a challenging problem you faced at work and how you solved it.",
      evaluates: "problem-solving",
      alignedWith: "innovation",
    },
  ],

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef?.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef = stream;
        set({ isCameraOn: true });
      }
    }
  },

  startInterview: async () => {
    if (!videoRef?.current || get().isRecording) return;
    const stream = videoRef.current.srcObject as MediaStream;
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const videoUrl = URL.createObjectURL(blob);
      const videoLink = document.createElement("a");
      videoLink.href = videoUrl;
      videoLink.download = "interview.webm";
      document.body.appendChild(videoLink);
      videoLink.click();
      document.body.removeChild(videoLink);
      URL.revokeObjectURL(videoUrl);

      const timestampBlob = new Blob([JSON.stringify(get().timestamps, null, 2)], {
        type: "application/json",
      });
      const timestampUrl = URL.createObjectURL(timestampBlob);
      const timestampLink = document.createElement("a");
      timestampLink.href = timestampUrl;
      timestampLink.download = "timestamps.json";
      document.body.appendChild(timestampLink);
      timestampLink.click();
      document.body.removeChild(timestampLink);
      URL.revokeObjectURL(timestampUrl);
    };

    recordedChunks = [];
    mediaRecorder.start();
    setTimeout(() => set({ isRecording: true }), 1000);

    // Initialize Speech Recognition
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    // recognition = new SpeechRecognitionAPI();
    // recognition.continuous = true;
    // recognition.interimResults = false;
    // recognition.lang = "en-US";

    // recognition.onresult = (event: SpeechRecognitionEvent) => {
    //   const lastResult = event.results[event.results.length - 1];
    //   const transcript = lastResult[0].transcript.trim();
    //   if (transcript && get().expectingUserInput) {
    //     get().endCurrentQuestion(transcript);
    //   }
    // };

    // recognition.start();

    // await speak("Welcome to the interview. Let's begin.");

    for (const question of get().questions) {
      get().addQuestionTimestamp();
      // await speak(question.questionText);
      get().addTranscript(question.questionText, "bot");

      await new Promise<void>((resolve) => {
        set({ userResponseResolver: resolve, expectingUserInput: true });
      });
    }

    // await speak("Thank you for completing the interview.");
    get().stopInterview();
  },

  stopInterview: () => {
    if (mediaRecorder && get().isRecording) {
      mediaRecorder.stop();
    }
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
    set({ isRecording: false, expectingUserInput: false });
  },

  addQuestionTimestamp: () =>
    set((state) => ({
      timestamps: [...state.timestamps, { start: Date.now(), end: 0 }],
    })),

  addTranscript: (message, sender) =>
    set((state) => ({
      transcripts: [...state.transcripts, { message, time: Date.now(), sender }],
    })),

  endCurrentQuestion: (userTranscript) =>
    set((state) => {
      const lastIndex = state.timestamps.length - 1;
      if (lastIndex >= 0) {
        state.timestamps[lastIndex].end = Date.now();
      }
      state.transcripts.push({
        message: userTranscript,
        time: Date.now(),
        sender: "user",
      });
      if (state.userResponseResolver) {
        state.userResponseResolver();
      }
      return { expectingUserInput: false, userResponseResolver: null };
    }),
}));
