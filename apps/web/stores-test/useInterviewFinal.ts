import { create } from "zustand";
import { speak } from "@/lib/elevenlabs";
import { Candidate, Interview, Question } from "@/lib/types";
import { endpoints } from "@/lib/endpoint";
import api from "@/lib/axios";

interface QuestionTimestamp {
  questionId: string;
  start: number;
  end: number;
}

interface InterviewState {
  timestamps: QuestionTimestamp[];
  recordingStartTime: number | null;
  isRecording: boolean;
  isCameraOn: boolean;
  currentQuestionIndex: number;
  interview: Interview | null;
  questions: Question[];
  candidate: Candidate | null;
  role: string;
  isValid: boolean;
  isExpired: boolean;
  isVerifying: boolean;
  startInterview: () => Promise<void>;
  nextQuestion: () => Promise<void>;
  endCurrentQuestion: () => void;
  stopInterview: () => void;
  toggleCamera: () => Promise<void>;
  setVideoRef: (ref: React.RefObject<HTMLVideoElement | null>) => void;
  verifyToken: (token: string) => Promise<void>;
}

let videoRef: React.RefObject<HTMLVideoElement | null> | null = null;
let streamRef: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

export const useInterviewFinalStore = create<InterviewState>((set, get) => ({
  timestamps: [],
  recordingStartTime: null,
  isRecording: false,
  isCameraOn: false,
  currentQuestionIndex: 0,
  questions: [
  ],
  interview: null,
  isValid: false,
  isExpired: false,
  isVerifying: false,
  candidate: null,
  // questions: [],
  role: "",
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

    // await speak("Welcome to the interview. Let's begin.");

    // Start recording
    const stream = videoRef.current.srcObject as MediaStream;
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const timestampBlob = new Blob(
        [JSON.stringify(get().timestamps, null, 2)],
        { type: "application/json" }
      );

      try {
        // Upload video
        const videoFilename = `${Date.now()}_interview.webm`;
        const resVideo = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload/generate-url`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: videoFilename,
              contentType: "video/webm",
              interviewId: get().interview?.id, // make sure you pass this
            }),
          }
        );

        if (!resVideo.ok) throw new Error("Failed to get signed URL for video");
        const { uploadUrl: videoUploadUrl, publicUrl: videoPublicUrl } =
          await resVideo.json();

        const uploadVideo = await fetch(videoUploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "video/webm" },
          body: blob,
        });
        if (!uploadVideo.ok) throw new Error("Video upload failed");

        // Upload timestamps
        // const timestampFilename = `${Date.now()}_timestamps.json`;
        // const resTimestamp = await fetch(
        //   `${process.env.NEXT_PUBLIC_API_URL}/upload/generate-url`,
        //   {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({
        //       filename: timestampFilename,
        //       contentType: "application/json",
        //       interviewId: get().interview?.id, // optional if you want to save timestamp too
        //     }),
        //   }
        // );

        // if (!resTimestamp.ok)
        //   throw new Error("Failed to get signed URL for timestamps");
        // const { uploadUrl: timestampUploadUrl, publicUrl: timestampPublicUrl } =
        //   await resTimestamp.json();

        // const uploadTimestamp = await fetch(timestampUploadUrl, {
        //   method: "PUT",
        //   headers: { "Content-Type": "application/json" },
        //   body: timestampBlob,
        // });
        // if (!uploadTimestamp.ok) throw new Error("Timestamps upload failed");

        // Optionally save the URLs in state
        // setUploadedUrls({
        //   video: videoPublicUrl,
        //   timestamps: timestampPublicUrl,
        // });
        console.log({ videoPublicUrl });
        // console.log("Uploads completed ✅", {
        //   video: videoPublicUrl,
        //   timestamps: timestampPublicUrl,
        // });
      } catch (err) {
        console.error(err);
        alert("Upload failed");
      }

      // const blob = new Blob(recordedChunks, { type: "video/webm" });
      // const url = URL.createObjectURL(blob);

      // const link = document.createElement("a");
      // link.href = url;
      // link.download = "interview.webm";
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      // URL.revokeObjectURL(url);

      // const timestampBlob = new Blob(
      //   [JSON.stringify(get().timestamps, null, 2)],
      //   {
      //     type: "application/json",
      //   }
      // );
      // const timestampUrl = URL.createObjectURL(timestampBlob);
      // const timestampLink = document.createElement("a");
      // timestampLink.href = timestampUrl;
      // timestampLink.download = "timestamps.json";
      // document.body.appendChild(timestampLink);
      // timestampLink.click();
      // document.body.removeChild(timestampLink);
      // URL.revokeObjectURL(timestampUrl);
    };

    mediaRecorder.start();
    const startTime = performance.now();
    setTimeout(
      () => set({ isRecording: true, recordingStartTime: startTime }),
      500
    );

    // await get().nextQuestion();
  },

  nextQuestion: async () => {
    const { questions, currentQuestionIndex, timestamps, recordingStartTime } =
      get();

    if (currentQuestionIndex >= questions.length) return;

    const question = questions[currentQuestionIndex];

    // await speak(question.questionText); // Speak first

    const now = performance.now();
    const relativeStart = recordingStartTime ? now - recordingStartTime : 0;

    timestamps.push({
      questionId: question.id!,
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
    set({ isRecording: false });
  },
  verifyToken: async (token: string) => {
    set({ isVerifying: true });
    try {
      const { data } = await api.get(
        `${endpoints.public.accessInterview(encodeURIComponent(token))}`
      );

      if (data.valid) {
        set({
          interview: data.interview,
          candidate: data.interview.candidate,
          questions: data.interview.interviewTemplate.questions,
          role: data.interview.position,
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
