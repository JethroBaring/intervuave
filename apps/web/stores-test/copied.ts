import { create } from "zustand";

interface Transcript {
  message: string;
  sender: "user" | "bot";
  time: number;
}

interface InterviewState {
  isCameraOn: boolean;
  isRecording: boolean;
  expectingUserInput: boolean;
  videoRef: HTMLVideoElement | null;
  transcripts: Transcript[];

  setVideoRef: (ref: React.MutableRefObject<HTMLVideoElement | null>) => void;
  toggleCamera: () => void;
  startInterview: () => void;
  stopInterview: () => void;
  addTranscript: (message: string, sender: "user" | "bot") => void;
  endCurrentQuestion: () => void;
  resetInterview: () => void;
}

export const useInterviewCopiedStore = create<InterviewState>((set) => ({
  isCameraOn: false,
  isRecording: false,
  expectingUserInput: false,
  videoRef: null,
  transcripts: [],

  setVideoRef: (ref) => set({ videoRef: ref.current }),
  toggleCamera: () =>
    set((state) => {
      if (state.videoRef) {
        if (!state.isCameraOn) {
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
              if (state.videoRef) state.videoRef.srcObject = stream;
            });
        } else {
          const tracks = (state.videoRef?.srcObject as MediaStream)?.getTracks();
          tracks?.forEach((track) => track.stop());
          if (state.videoRef) state.videoRef.srcObject = null;
        }
      }
      return { isCameraOn: !state.isCameraOn };
    }),

  startInterview: () =>
    set(() => ({
      isRecording: true,
      expectingUserInput: true,
      transcripts: [],
    })),

  stopInterview: () =>
    set(() => ({
      isRecording: false,
      expectingUserInput: false,
    })),

  addTranscript: (message, sender) =>
    set((state) => ({
      transcripts: [
        ...state.transcripts,
        { message, sender, time: Date.now() },
      ],
    })),

  endCurrentQuestion: () =>
    set(() => ({
      expectingUserInput: false,
    })),

  resetInterview: () =>
    set(() => ({
      isCameraOn: false,
      isRecording: false,
      expectingUserInput: false,
      videoRef: null,
      transcripts: [],
    })),
}));
