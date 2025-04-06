import { create } from "zustand";
import api from "@/lib/axios";
import { useAuthStore } from "./authStore";
import { usePagesDataStore } from "./pagesDataStore";

interface Role {
  id: string;
  title: string;
  companyId: string;
  interviewTemplateId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

interface CreateRoleInput {
  title: string;
  interviewTemplateId: string;
}

interface UpdateRoleInput {
  title?: string;
  interviewTemplateId?: string;
}

interface RoleStore {
  loading: boolean;
  error: string | null;

  addRole: (data: CreateRoleInput) => Promise<void>;
  editRole: (id: string, data: UpdateRoleInput) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
}


export const useRoleStore = create<RoleStore>((set, get) => ({
  loading: false,
  error: null,

  addRole: async (data) => {
    set({ loading: true, error: null });
    try {
      const companyId = useAuthStore.getState().getCompanyId()

      const res = await api.post("/positions", {
        title: data.title,
        companyId: companyId,
        interviewTemplateId: data.interviewTemplateId,
      });
      usePagesDataStore.setState({roles: [...usePagesDataStore.getState().roles, res.data]})
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to create role" });
    } finally {
      set({ loading: false });
    }
  },

  editRole: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/positions/${id}`, data);
      // set((state) => ({
      //   roles: state.roles.map((role) =>
      //     role.id === id ? { ...role, ...res.data } : role
      //   ),
      // }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to update role" });
    } finally {
      set({ loading: false });
    }
  },

  deleteRole: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/positions/${id}`);
      // set((state) => ({
      //   roles: state.roles.filter((role) => role.id !== id),
      // }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to delete role" });
    } finally {
      set({ loading: false });
    }
  },
}));
