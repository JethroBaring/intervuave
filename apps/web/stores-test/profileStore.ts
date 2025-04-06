import api from "@/lib/axios";
import { create } from "zustand";

interface CoreValue {
  id?: string;
  name: string;
  description: string;
}

interface CompanyProfileState {
  name: string;
  logoUrl: string;
  website: string;
  address: string;
  mission: string;
  vision: string;
  culture: string;
  coreValues: CoreValue[];

  // Company info logic
  setField: (
    field: keyof Omit<
      CompanyProfileState,
      | "coreValues"
      | "setField"
      | "setAll"
      | "updateToBackend"
      | "loadFromBackend"
      | "addCoreValue"
      | "updateCoreValue"
      | "removeCoreValue"
    >,
    value: string
  ) => void;
  setAll: (
    data: Partial<
      Omit<
        CompanyProfileState,
        | "setField"
        | "setAll"
        | "updateToBackend"
        | "loadFromBackend"
        | "addCoreValue"
        | "updateCoreValue"
        | "removeCoreValue"
      >
    >
  ) => void;
  updateToBackend: (
    id: string,
    data: {
      name?: string;
      mission?: string;
      vision?: string;
      culture?: string;
    }
  ) => Promise<void>;
  loadFromBackend: (id: string) => Promise<void>;

  // Core value logic
  addCoreValue: (value: CoreValue) => Promise<void>;
  updateCoreValue: (id: string, value: CoreValue) => Promise<void>;
  removeCoreValue: (id: string) => Promise<void>;
}

export const useCompanyProfileStore = create<CompanyProfileState>(
  (set, get) => ({
    name: "",
    logoUrl: "",
    website: "",
    address: "",
    mission: "",
    vision: "",
    culture: "",
    coreValues: [],

    setField: (field, value) => set(() => ({ [field]: value })),
    setAll: (data) => set((state) => ({ ...state, ...data })),

    updateToBackend: async (
      id?: string,
      data?: {
        name?: string;
        mission?: string;
        vision?: string;
        culture?: string;
      }
    ) => {
      if (!data || Object.keys(data).length === 0) return;

      const res = await api.patch(`/companies/${id}`, data);

      // Only update the store if backend succeeded
      set((state) => ({
        ...state,
        ...res.data, // assuming backend returns updated company fields
      }));
    },

    loadFromBackend: async (id: string) => {
      // console.log(id);
      // const { data } = await api.get(`/companies/${id}`);
      // console.log(data);
      // set(() => ({
      //   ...data,
      // }));
    },

    addCoreValue: async (value) => {
      const { data } = await api.post("/core-values", value);
      set((state) => ({ coreValues: [...state.coreValues, data] }));
    },

    updateCoreValue: async (id, value) => {
      await api.put(`/core-values/${id}`, value);
      set((state) => {
        const updated = state.coreValues.map((val) =>
          val.id === id ? { ...val, ...value } : val
        );
        return { coreValues: updated };
      });
    },

    removeCoreValue: async (id) => {
      await api.delete(`/core-values/${id}`);
      set((state) => ({
        coreValues: state.coreValues.filter((val) => val.id !== id),
      }));
    },
  })
);
