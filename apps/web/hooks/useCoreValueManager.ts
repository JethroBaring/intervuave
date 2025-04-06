import { useState, useCallback } from "react";
import { useCompanyStore } from "@/stores/useCompanyStore";
import api from "@/lib/axios";
import { endpoints } from "@/lib/endpoint";

interface CoreValue {
  id: string;
  name: string;
  description: string;
}

export const useCoreValueManager = (initialData?: CoreValue[]) => {
  const [coreValue, setCoreValue] = useState<CoreValue>({
    id: "",
    name: "",
    description: "",
  });
  const [coreValues, setCoreValues] = useState<CoreValue[]>(initialData ? initialData : []);
  const [selectedCoreValueIndex, setSelectedCoreValueIndex] = useState<number | null>(null);
  const [isNewCoreValueModalOpen, setIsNewCoreValueModalOpen] = useState(false);
  const [isViewCoreValueModalOpen, setIsViewCoreValueModalOpen] = useState(false);
  const [isEditCoreValueModalOpen, setIsEditCoreValueModalOpen] = useState(false);

  const { companyId } = useCompanyStore();

  const addCoreValue = useCallback((newCoreValue: Omit<CoreValue, "id">) => {
    setCoreValues((prev) => [
      ...prev,
      { ...newCoreValue, id: crypto.randomUUID() },
    ]);
  }, []);

  const editCoreValue = useCallback((id: string, updatedFields: Partial<Omit<CoreValue, "id">>) => {
    setCoreValues((prev) =>
      prev.map((coreValue) =>
        coreValue.id === id ? { ...coreValue, ...updatedFields } : coreValue
      )
    );
  }, []);

  const removeCoreValue = useCallback((index: number) => {
    setCoreValues((prev) => prev.filter((_, i) => i !== index));
    setSelectedCoreValueIndex(null);
  }, []);

  const getCoreValue = useCallback(
    (index: number) => {
      return coreValues[index] ?? null;
    },
    [coreValues]
  );

  const selectCoreValue = useCallback((index: number) => {
    setSelectedCoreValueIndex(index);
  }, []);

  const clearSelectedCoreValue = useCallback(() => {
    setSelectedCoreValueIndex(null);
  }, []);

  const submit = useCallback(async () => {
    try {
      const cleanedCoreValues = coreValues.map((data) => ({
        name: data.name,
        description: data.description,
      }));

      await api.patch(`${endpoints.companies.update(companyId)}`, {
        coreValues: cleanedCoreValues,
      });

      // Optional: You can trigger company store refresh here
      await useCompanyStore.getState().fetchAllCompanyData(companyId);

      return true;
    } catch (err) {
      console.error("Failed to update core values:", err);
      return false;
    }
  }, [coreValues, companyId]);

  const closeAllModals = () => {
    setIsNewCoreValueModalOpen(false);
    setIsViewCoreValueModalOpen(false);
    setIsEditCoreValueModalOpen(false);
  };

  return {
    coreValues,
    coreValue,
    setCoreValue,
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
    submit,
    closeAllModals,
    setCoreValues
  };
};
