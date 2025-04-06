import { useState, useCallback } from "react";
import { useCompanyStore } from "@/stores/useCompanyStore";
import api from "@/lib/axios";
import { endpoints } from "@/lib/endpoint";

interface CoreValue {
  id: string;
  name: string;
  description: string;
}

interface OnboardingData {
  mission: string;
  vision: string;
  culture: string;
  coreValues: CoreValue[];
}

export const useOnboardingSteps = (totalSteps = 6) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [coreValue, setCoreValue] = useState<CoreValue>({
    id: "",
    name: "",
    description: "",
  });
  const [isNewCoreValueModalOpen, setIsNewCoreValueModalOpen] = useState(false);
  const [isViewCoreValueModalOpen, setIsViewCoreValueModalOpen] =
    useState(false);
  const [isEditCoreValueModalOpen, setIsEditCoreValueModalOpen] =
    useState(false);
  const [data, setData] = useState<OnboardingData>({
    mission: "",
    vision: "",
    culture: "",
    coreValues: [],
  });
  const [selectedCoreValueIndex, setSelectedCoreValueIndex] = useState<
    number | null
  >(null);

  const { fetchAllCompanyData } = useCompanyStore();

  const nextStep = useCallback(() => {
    console.log("im here");
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  const resetSteps = useCallback(() => {
    setCurrentStep(1);
    setData({
      mission: "",
      vision: "",
      culture: "",
      coreValues: [],
    });
    setSelectedCoreValueIndex(null);
  }, []);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData((prev) => ({
      ...prev,
      ...newData,
    }));
  }, []);

  const addCoreValue = useCallback((newCoreValue: CoreValue) => {
    setData((prev) => ({
      ...prev,
      coreValues: [
        ...prev.coreValues,
        { ...newCoreValue, id: crypto.randomUUID() },
      ],
    }));
  }, []);

  const editCoreValue = useCallback(
    (id: string, updatedFields: Partial<Omit<CoreValue, "id">>) => {
      setData((prev) => ({
        ...prev,
        coreValues: prev.coreValues.map((coreValue) =>
          coreValue.id === id ? { ...coreValue, ...updatedFields } : coreValue
        ),
      }));
    },
    []
  );

  const removeCoreValue = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      coreValues: prev.coreValues.filter((_, i) => i !== index),
    }));
    setSelectedCoreValueIndex(null);
  }, []);

  const getCoreValue = useCallback(
    (index: number) => {
      return data.coreValues[index] ?? null;
    },
    [data.coreValues]
  );

  const selectCoreValue = useCallback((index: number) => {
    setSelectedCoreValueIndex(index);
  }, []);

  const clearSelectedCoreValue = useCallback(() => {
    setSelectedCoreValueIndex(null);
  }, []);

  const submit = useCallback(async () => {
    const companyId = useCompanyStore.getState().companyId;
    try {
      const cleanedCoreValues = data.coreValues.map((data) => ({
        name: data.name,
        description: data.description,
      }));
      await api.patch(`${endpoints.companies.update(companyId)}`, {
        ...data,
        coreValues: cleanedCoreValues,
      });
      return true;
    } catch (err) {
      console.error("Onboarding submission failed:", err);
      return false;
    }
  }, [data, fetchAllCompanyData]);

  const closeModal = () => {
    setIsNewCoreValueModalOpen(false);
    setIsViewCoreValueModalOpen(false);
    setIsEditCoreValueModalOpen(false);
  };

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    resetSteps,
    isLastStep: currentStep === totalSteps,
    isFirstStep: currentStep === 1,
    data,
    updateData,
    submit,
    addCoreValue,
    editCoreValue,
    removeCoreValue,
    getCoreValue,
    selectedCoreValueIndex,
    selectCoreValue,
    clearSelectedCoreValue,
    isNewCoreValueModalOpen,
    setIsNewCoreValueModalOpen,
    isViewCoreValueModalOpen,
    setIsViewCoreValueModalOpen,
    isEditCoreValueModalOpen,
    setIsEditCoreValueModalOpen,
    coreValue,
    setCoreValue,
    closeModal,
  };
};
