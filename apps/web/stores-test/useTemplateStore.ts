import api from "@/lib/axios";
import { InterviewTemplate } from "@/lib/types";
import { create } from "zustand";
import { usePagesDataStore } from "./pagesDataStore";
import { useToastStore } from "./toastStore";
import { endpoints } from "@/lib/endpoint";
import { useAuthStore } from "./authStore";

interface TemplateStore {
  selectedTemplate: InterviewTemplate | null;

  addTemplate: (data: InterviewTemplate) => Promise<void>;
  editTemplate: (data: InterviewTemplate) => Promise<void>;
  deleteTemplate: () => Promise<void>;

  setSelectedTemplate: (template: InterviewTemplate | null) => void;

  // UI
  isNewTemplateModalOpen: boolean;
  openNewTemplateModal: () => void;

  isViewTemplateModalOpen: boolean;
  openViewTemplateModal: () => void;

  isEditTemplateModalOpen: boolean;
  openEditTemplateModal: () => void;
  closeTemplateModal: () => void;

  isWarningModalOpen: boolean;
  openWarningModal: () => void;
  closeWarningModal: () => void;

  isNewQuestionModalOpen: boolean;
  openNewQuestionModal: () => void;

  isViewQuestionModalOpen: boolean;
  openViewQuestionModal: () => void;

  isEditQuestionModalOpen: boolean;
  openEditQuestionModal: () => void;
  closeQuestionModal: () => void;

  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;

  reset: () => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  selectedTemplate: null,

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  addTemplate: async (data) => {
    try {
      const companyId = useAuthStore.getState().user.companyId;
      const res = await api.post(`${endpoints.templates.create(companyId)}`, {
        name: data.name,
        companyId: data.companyId,
        questions: data.questions,
        metrics: data.metrics,
      });
      console.log("Template created:", res.data);
      set({ isNewTemplateModalOpen: false });
      usePagesDataStore.setState((state) => ({
        templates: [...state.templates, res.data],
      }));
      useToastStore.getState().showToast({
        title: "Template Created",
        message: "The new interview template was successfully created.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to create template", error);
    }
  },

  editTemplate: async (data) => {
    const template: any = get().selectedTemplate;

    if (!template) return;

    try {
      const res = await api.patch(
        `${endpoints.templates.update(template.id!)}`,
        {
          name: data.name,
          metrics: data.metrics,
          questions: data.questions,
        }
      );
      console.log("Template updated:", res.data);
      set({ selectedTemplate: res.data });
      usePagesDataStore.setState((state) => ({
        templates: state.templates.map((template) =>
          template.id === res.data.id ? res.data : template
        ),
      }));


      console.log(res.data)
      set({ isEditTemplateModalOpen: false, selectedTemplate: null });
      useToastStore.getState().showToast({
        title: "Template Updated",
        message: "The interview template has been successfully updated.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update template", error);
    }
  },

  deleteTemplate: async () => {
    const template = get().selectedTemplate;
    if (!template) return;
    try {
      await api.delete(`/templates/${template.id}`);
      console.log("Template deleted");
      set({ selectedTemplate: null, isWarningModalOpen: false });
      usePagesDataStore.setState((state) => ({
        templates: state.templates.filter((data) => data.id !== template.id),
      }));
      useToastStore.getState().showToast({
        title: "Template Deleted",
        message: "The new interview template was successfully created.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to delete template", error);
    }
  },

  // UI state
  isNewTemplateModalOpen: false,
  openNewTemplateModal: () => set({ isNewTemplateModalOpen: true }),

  isViewTemplateModalOpen: false,
  openViewTemplateModal: () => set({ isViewTemplateModalOpen: true }),

  isEditTemplateModalOpen: false,
  openEditTemplateModal: () => set({ isEditTemplateModalOpen: true }),

  closeTemplateModal: () => set({ isNewTemplateModalOpen: false }),

  isWarningModalOpen: false,
  openWarningModal: () => set({ isWarningModalOpen: true }),
  closeWarningModal: () => set({ isWarningModalOpen: false }),

  isNewQuestionModalOpen: false,
  openNewQuestionModal: () => set({ isNewQuestionModalOpen: true }),

  isViewQuestionModalOpen: false,
  openViewQuestionModal: () => set({ isViewQuestionModalOpen: true }),

  isEditQuestionModalOpen: false,
  openEditQuestionModal: () => set({ isEditQuestionModalOpen: true }),

  closeQuestionModal: () =>
    set({
      isNewQuestionModalOpen: false,
      isViewQuestionModalOpen: false,
      isEditQuestionModalOpen: false,
    }),

  currentStep: 1,
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),

  reset: () =>
    set({
      selectedTemplate: null,
      isNewTemplateModalOpen: false,
      isViewTemplateModalOpen: false,
      isEditTemplateModalOpen: false,
      isNewQuestionModalOpen: false,
      isViewQuestionModalOpen: false,
      isEditQuestionModalOpen: false,
      isWarningModalOpen: false,
      currentStep: 1,
    }),
}));
