import { Interview, Candidate } from "@/lib/types";
import { create } from "zustand";
import { usePagesDataStore } from "./pagesDataStore";
import api from "@/lib/axios";
import { useToastStore } from "./toastStore";
import { endpoints } from "@/lib/endpoint";
import { useAuthStore } from "./authStore";

interface InterviewStore {
  selectedInterview: Interview | null;
  selectedCandidate: Candidate | null;
  candidateForm: Candidate | null;

  createInterview: (data: {
    interview: Partial<Interview>;
    candidate?: Candidate;
  }) => Promise<void>;
  deleteInterview: () => Promise<void>;
  setSelectedInterview: (interview: Interview | null) => void;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  setCandidateForm: (candidate: Candidate | null) => void;

  // UI
  isNewInterviewModalOpen: boolean;
  openNewInterviewModal: () => void;

  isViewInterviewModalOpen: boolean;
  openViewInterviewModal: () => void;

  isWarningModalOpen: boolean;
  openWarningModal: () => void;
  closeWarningModal: () => void;
  closeInterviewModal: () => void;
}

export const useInterviewStore = create<InterviewStore>((set, get) => ({
  selectedInterview: null,
  selectedCandidate: null,
  candidateForm: null,

  setSelectedInterview: (interview) => set({ selectedInterview: interview }),
  setSelectedCandidate: (candidate) => set({ selectedCandidate: candidate }),
  setCandidateForm: (candidate) => set({ candidateForm: candidate }),

  createInterview: async ({ interview, candidate }) => {
    const companyId = useAuthStore.getState().user.companyId;
    try {
      let candidateId = candidate?.id;

      // If candidate is not selected but form data exists → Create candidate first
      if (!candidateId && get().candidateForm) {
        const res = await api.post(
          `${endpoints.candidates.create(companyId)}`,
          get().candidateForm
        );
        candidateId = res.data.id;
        usePagesDataStore.setState((state) => ({
          candidates: [...state.candidates, res.data],
        }));
      }

      const res = await api.post(`${endpoints.interviews.create(companyId)}`, {
        ...interview,
        candidateId,
      });

      console.log("Interview created:", res.data);
      set({ isNewInterviewModalOpen: false, candidateForm: null });
      usePagesDataStore.setState((state) => ({
        interviews: [...state.interviews, res.data],
      }));
      useToastStore.getState().showToast({
        title: "Interview Created",
        message: "The interview has been successfully scheduled.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to create interview", error);
    }
  },

  deleteInterview: async () => {
    const interview = get().selectedInterview;
    if (!interview) return;
    try {
      const companyId = useAuthStore.getState().user.companyId;
      await api.delete(
        `${endpoints.interviews.delete(
          get().selectedCandidate?.id!,
          interview.id!
        )}`
      );
      console.log("Interview deleted");
      set({ selectedInterview: null, isWarningModalOpen: false });
      usePagesDataStore.setState((state) => ({
        interviews: state.interviews.filter((i) => i.id !== interview.id),
      }));
      useToastStore.getState().showToast({
        title: "Interview Deleted",
        message: "The interview has been successfully removed.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to delete interview", error);
    }
  },

  // UI
  isNewInterviewModalOpen: false,
  openNewInterviewModal: () => set({ isNewInterviewModalOpen: true }),

  isViewInterviewModalOpen: false,
  openViewInterviewModal: () => set({ isViewInterviewModalOpen: true }),

  closeInterviewModal: () =>
    set({
      isNewInterviewModalOpen: false,
      isViewInterviewModalOpen: false,
    }),

  isWarningModalOpen: false,
  openWarningModal: () => set({ isWarningModalOpen: true }),
  closeWarningModal: () => set({ isWarningModalOpen: false }),
}));
