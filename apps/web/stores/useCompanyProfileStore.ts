import { create } from "zustand";
import api from "@/lib/axios";
import { useCompanyStore } from "./useCompanyStore";

interface CoreValue {
  id?: string;
  name: string;
  description: string;
}

interface CompanyProfileState {
  updateToBackend: (
    id: string,
    data: {
      name?: string;
      mission?: string;
      vision?: string;
      culture?: string;
      coreValues?: CoreValue[]
    }
  ) => Promise<void>;
}

export const useCompanyProfileStore = create<CompanyProfileState>(() => ({
  updateToBackend: async (id, data) => {
    if (!data || Object.keys(data).length === 0) return;

    try {
      const res = await api.patch(`/companies/${id}`, data);
      
      useCompanyStore.setState((state) => ({
        ...state,
        mission: res.data.mission,
        vision: res.data.vision,
        culture: res.data.culture,
        coreValues: res.data.coreValues
        // Optional: add name/logo/website if you want
      }));
      console.log(useCompanyStore.getState().mission)
    } catch (error) {
      console.error("Failed to update company profile", error);
      throw error;
    }
  }
}));
