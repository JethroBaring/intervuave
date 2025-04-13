import { create } from "zustand";
import { setSharedAudioContext, speak } from "@/lib/elevenlabs";
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
  nextDisable: boolean;
  setCurrentStep: (step: number) => void;
  startInterview: () => Promise<void>;
  nextQuestion: () => Promise<void>;
  endCurrentQuestion: () => void;
  stopInterview: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  setVideoRef: (ref: React.RefObject<HTMLVideoElement | null>) => void;
  verifyToken: (token: string) => Promise<void>;
  forceStopCamera: () => void;
  getStreamRef: () => MediaStream | null;
}

let videoRef: React.RefObject<HTMLVideoElement | null> | null = null;
let streamRef: MediaStream | null = null;
let cameraStream: MediaStream | null = null;
let audioStream: MediaStream | null = null;
let audioContext: AudioContext | null = null;
let audioDestination: MediaStreamAudioDestinationNode | null = null;
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
  nextDisable: false,

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
      cameraStream = null;
      audioStream = null;
      set({ isCameraOn: false });
    } else {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (videoRef?.current) {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.play();
      }
      set({ isCameraOn: true });
    }
  },

  startInterview: async () => {
    if (get().isRecording || !videoRef?.current) return;

    await api.patch(`${endpoints.public.startInterview(encodeURIComponent(get().interviewToken!))}`);

    // Setup AudioContext
    audioContext = new AudioContext();
    audioDestination = audioContext.createMediaStreamDestination();

    const micSource = audioContext.createMediaStreamSource(audioStream!);
    micSource.connect(audioDestination);

    setSharedAudioContext(audioContext, audioDestination);
    
    // Combine video (camera) + audio (mic + AI)
    const finalStream = new MediaStream([
      ...cameraStream!.getVideoTracks(),
      ...audioDestination.stream.getAudioTracks(),
    ]);

    recordedChunks = [];
    mediaRecorder = new MediaRecorder(finalStream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      try {
        await speak(`Thank you for completing your interview, ${get().candidate?.firstName || "candidate"}. We appreciate your time and effort.`, (isSpeaking) =>
          set({ isSpeaking })
        );
        set({ isRecording: false, isCameraOn: false });
        set({ isSubmitting: true, currentStep: 5 });

        const videoFilename = `${Date.now()}_interview.webm`;
        const { data } = await api.post(
          `${endpoints.public.getSignedInterviewUrl(encodeURIComponent(get().interviewToken!))}`,
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
          `${endpoints.public.submitInterview(encodeURIComponent(get().interviewToken!))}`,
          { timestamps: get().timestamps }
        );
        set({ isSubmitting: false });
      } catch (err) {
        console.error(err);
        alert("Upload failed");
      }
    };

    mediaRecorder.start();
    const startTime = performance.now();
    setTimeout(() => set({ isRecording: true, recordingStartTime: startTime }), 500);

    set({ nextDisable: true });

    await speak(`Hello ${get().interview?.candidate.firstName}! Welcome to your interview. Let's get started.`, (isSpeaking) =>
      set({ isSpeaking })
    );

    await get().nextQuestion();
  },

  nextQuestion: async () => {
    const { questions, currentQuestionIndex, timestamps, recordingStartTime } = get();

    if (currentQuestionIndex >= questions.length) return;

    const question = questions[currentQuestionIndex];
    set({ nextDisable: true });

    await speak(question.questionText, (isSpeaking) => set({ isSpeaking }));

    set({ nextDisable: false });

    const now = performance.now();
    const relativeStart = recordingStartTime ? now - recordingStartTime : 0;

    timestamps.push({
      questionId: question.id!,
      questionText: question.questionText,
      start: Math.round(relativeStart),
      end: 0,
    });

    set({ timestamps });
  },

  endCurrentQuestion: () => {
    const now = performance.now();
    const { timestamps, recordingStartTime } = get();
    if (timestamps.length > 0 && recordingStartTime !== null) {
      timestamps[timestamps.length - 1].end = Math.round(now - recordingStartTime);
    }
    set({ timestamps });
  },

  stopInterview: async () => {
    get().endCurrentQuestion();
    if (mediaRecorder && get().isRecording) {
      mediaRecorder.stop();
    }
  },

  verifyToken: async (token: string) => {
    set({ isVerifying: true });
    try {
      const { data } = await api.get(`${endpoints.public.accessInterview(encodeURIComponent(token))}`);
      if (data.valid) {
        set({
          company: data.interview.company,
          interview: data.interview,
          candidate: data.interview.candidate,
          questions: data.interview.interviewTemplate.questions,
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

  forceStopCamera: () => {
    if (streamRef) {
      streamRef.getTracks().forEach((track) => track.stop());
      streamRef = null;
    }
    if (videoRef?.current) {
      videoRef.current.srcObject = null;
    }
    set({ isCameraOn: false });
  },

  getStreamRef: () => {
    return cameraStream;
  },
}));
