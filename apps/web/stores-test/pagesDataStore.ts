import { create } from "zustand";
import api from "@/lib/axios";
import { useAuthStore } from "./authStore";
import { endpoints } from "@/lib/endpoint";
import { Candidate, CoreValue, Interview, Role } from "@/lib/types";
import { InterviewTemplate } from "./templateStore";

interface PagesDataStore {
  loading: boolean;
  error: string | null;

  roles: Role[];
  templates: InterviewTemplate[];
  candidates: Candidate[];
  interviews: Interview[];

  mission: string;
  vision: string;
  culture: string;
  coreValues: CoreValue[];

  fetchAllCompanyData: () => Promise<void>;
  resetPagesData: () => void;
}

export const usePagesDataStore = create<PagesDataStore>((set) => ({
  loading: false,
  error: null,
  roles: [],
  templates: [],
  candidates: [],
  interviews: [],
  mission: "",
  vision: "",
  culture: "",
  coreValues: [],

  fetchAllCompanyData: async () => {
    set({ loading: true, error: null });

    try {
      const companyId = useAuthStore.getState().user.companyId;
      const company: any = await api.get(
        `${endpoints.companies.find(companyId)}`
      );
      set({
        roles: company.data.roles || [],
        templates: company.data.interviewTemplates || [],
        candidates: company.data.candidates || [],
        interviews: company.data.interviews || [],
        coreValues: company.data.coreValues || [],
        mission: company.data.mission || "",
        vision: company.data.vision || "",
        culture: company.data.culture || "",
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to load company data",
      });
    } finally {
      set({ loading: false });
    }
  },

  resetPagesData: () =>
    set({
      roles: [],
      templates: [],
      loading: false,
      error: null,
    }),
}));
