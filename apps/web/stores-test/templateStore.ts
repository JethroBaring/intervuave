import { create } from "zustand";
import api from "@/lib/axios";

export interface Question {
  id: string;
  questionText: string;
  evaluates: string;
  alignedWith: string;
}

export interface Metric {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface InterviewTemplate {
  id: string;
  name: string;
  companyId: string;
  questions: Question[];
  metrics: Metric[];
}

interface TemplateStore {
  template: InterviewTemplate | null;
  templates: InterviewTemplate[];
  loading: boolean;
  error: string | null;

  fetchTemplates: (companyId: string) => Promise<void>;
  createTemplate: (data: {
    name: string;
    companyId: string;
    questions: Omit<Question, "id">[];
    metrics: Omit<Metric, "id">[];
  }) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  updateTemplateName: (name: string) => Promise<void>;

  addQuestionToExisting: (data: Omit<Question, "id">) => Promise<void>;
  editQuestion: (id: string, data: Omit<Question, "id">) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;

  // UI state
  isCreateTemplateStepOneModalOpen: boolean;
  isCreateTemplateStepTwoModalOpen: boolean;
  isCreateTemplateStepThreeModalOpen: boolean;
  isViewTemplateModalOpen: boolean;
  isEditTemplateModalOpen: boolean;
  isAddQuestionModalOpen: boolean;
  isEditQuestionModalOpen: boolean;
  isViewQuestionModalOpen: boolean;
  openStepModal: (step: 1 | 2 | 3) => void;
  closeAllModals: () => void;
  setViewTemplateModalOpen: (open: boolean) => void;
  setEditTemplateModalOpen: (open: boolean) => void;
  setAddQuestionModalOpen: (open: boolean) => void;
  setEditQuestionModalOpen: (open: boolean) => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  template: null,
  templates: [],
  loading: false,
  error: null,

  // UI modals
  isCreateTemplateStepOneModalOpen: false,
  isCreateTemplateStepTwoModalOpen: false,
  isCreateTemplateStepThreeModalOpen: false,
  isViewTemplateModalOpen: false,
  isEditTemplateModalOpen: false,
  isAddQuestionModalOpen: false,
  isEditQuestionModalOpen: false,
  isViewQuestionModalOpen: false,

  openStepModal: (step) => {
    set({
      isCreateTemplateStepOneModalOpen: step === 1,
      isCreateTemplateStepTwoModalOpen: step === 2,
      isCreateTemplateStepThreeModalOpen: step === 3,
    });
  },

  closeAllModals: () => {
    set({
      isCreateTemplateStepOneModalOpen: false,
      isCreateTemplateStepTwoModalOpen: false,
      isCreateTemplateStepThreeModalOpen: false,
      isViewTemplateModalOpen: false,
      isEditTemplateModalOpen: false,
      isAddQuestionModalOpen: false,
      isEditQuestionModalOpen: false,
    });
  },

  setViewTemplateModalOpen: (open) => set({ isViewTemplateModalOpen: open }),
  setEditTemplateModalOpen: (open) => set({ isEditTemplateModalOpen: open }),
  setAddQuestionModalOpen: (open) => set({ isAddQuestionModalOpen: open }),
  setEditQuestionModalOpen: (open) => set({ isEditQuestionModalOpen: open }),

  fetchTemplates: async (companyId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/templates/${companyId}`);
      set({ templates: res.data });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch templates",
      });
    } finally {
      set({ loading: false });
    }
  },

  createTemplate: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/templates", {
        name: data.name,
        company: {
          connect: {
            id: data.companyId,
          },
        },
        questions: {
          create: data.questions,
        },
        metrics: {
          create: data.metrics,
        },
      });
      set({ template: res.data });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to create template",
      });
    } finally {
      set({ loading: false });
    }
  },

  deleteTemplate: async (id: string) => {
    const { template } = get();
    if (!template) return;

    set({ loading: true, error: null });

    try {
      await api.delete(`/templates/${id}`);
      set({ template: null });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to delete template",
      });
    } finally {
      set({ loading: false });
    }
  },

  updateTemplateName: async (name) => {
    const { template } = get();
    if (!template) return;

    set({ loading: true, error: null });

    try {
      const res = await api.put(`/templates/${template.id}`, {
        name,
      });
      set((state) => ({
        template: {
          ...state.template!,
          name: res.data.name,
        },
        templates: state.templates.map((t) =>
          t.id === res.data.id ? { ...t, name: res.data.name } : t
        ),
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to update template name",
      });
    } finally {
      set({ loading: false });
    }
  },

  addQuestionToExisting: async (data) => {
    const template = get().template;
    if (!template) return;

    set({ loading: true, error: null });
    try {
      const res = await api.post(
        `/interview-templates/${template.id}/questions`,
        data
      );
      set((state) => ({
        template: {
          ...state.template!,
          questions: [...state.template!.questions, res.data],
        },
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to add question" });
    } finally {
      set({ loading: false });
    }
  },

  editQuestion: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/questions/${id}`, data);
      set((state) => ({
        template: {
          ...state.template!,
          questions: state.template!.questions.map((q) =>
            q.id === id ? res.data : q
          ),
        },
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to update question",
      });
    } finally {
      set({ loading: false });
    }
  },

  deleteQuestion: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/questions/${id}`);
      set((state) => ({
        template: {
          ...state.template!,
          questions: state.template!.questions.filter((q) => q.id !== id),
        },
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to delete question",
      });
    } finally {
      set({ loading: false });
    }
  },
}));
