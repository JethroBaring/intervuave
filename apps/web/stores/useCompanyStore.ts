import { create } from "zustand";
import api from "@/lib/axios";
import { endpoints } from "@/lib/endpoint";
import {
  Candidate,
  CoreValue,
  Interview,
  InterviewTemplate,
  Role,
} from "@/lib/types";

interface CompanyStore {
  loading: boolean;
  error: string | null;

  roles: Role[];
  templates: InterviewTemplate[];
  candidates: Candidate[];
  interviews: Interview[];

  isOnboarding: boolean;
  name: string;
  companyId: string;
  mission: string;
  vision: string;
  culture: string;
  coreValues: CoreValue[];

  fetchAllCompanyData: (companyId: string) => Promise<void>;
  resetPagesData: () => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  loading: false,
  error: null,
  roles: [],
  templates: [],
  candidates: [],
  interviews: [],
  isOnboarding: false,
  name: '',
  companyId: "",
  mission: "",
  vision: "",
  culture: "",
  coreValues: [],

  fetchAllCompanyData: async (companyId: string) => {
    set({ loading: true, error: null });

    try {
      const company: any = await api.get(
        `${endpoints.companies.find(companyId)}`
      );
      set({
        name: company.data.name,
        companyId,
        roles: company.data.roles || [],
        templates: company.data.interviewTemplates || [],
        candidates: company.data.candidates || [],
        interviews: company.data.interviews || [],
        coreValues: company.data.coreValues || [],
        mission: company.data.mission || "",
        vision: company.data.vision || "",
        culture: company.data.culture || "",
        isOnboarding: !company.data.mission || !company.data.vision || !company.data.culture || company.data.coreValues.lenght === 0
      });
      console.log(company.data.roles)
    } catch (err: any) {
    console.log({xd: err})
      set({
        error: err.response?.data?.message || "Failed to load company data",
      });
    } finally {
      set({ loading: false });
    }
    console.log({xd: 'hello'})
  },

  resetPagesData: () =>
    set({
      roles: [],
      templates: [],
      loading: false,
      error: null,
    }),
}));
