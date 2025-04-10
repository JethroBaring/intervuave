import { TCard } from "@/components/ui/shared/data";
import { create } from "zustand";

type InterviewStatus =
  | "draft"
  | "pending"
  | "submitted"
  | "processing"
  | "evaluated"
  | "expired";

interface InterviewState {
  isCardModalOpen: boolean;
  modalType: InterviewStatus | null;
  selectedCandidate: TCard | null;

  openCardModal: (candidate: TCard) => void;
  closeCardModal: () => void;
  clearSelectedCandidate: () => void;

  // Optional for UX: pending state for expire/resend actions
  isActionLoading: boolean;
  setActionLoading: (loading: boolean) => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  isCardModalOpen: false,
  modalType: null,
  selectedCandidate: null,

  openCardModal: (candidate) => {
    
    set({
      isCardModalOpen: true,
      selectedCandidate: candidate,
    })
    console.log("wew")
  },

  closeCardModal: () =>
    set({
      isCardModalOpen: false,
      modalType: null,
    }),

  clearSelectedCandidate: () =>
    set({
      selectedCandidate: null,
    }),

  isActionLoading: false,
  setActionLoading: (loading) => set({ isActionLoading: loading }),
}));
