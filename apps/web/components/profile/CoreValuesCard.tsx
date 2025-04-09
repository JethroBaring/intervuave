"use client";
import React from "react";
import { useModal } from "../../hooks-test/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../ui/form/input/InputField";
import Label from "../ui/form/Label";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { Plus } from "lucide-react";
import QuestionCard from "../ui/common/QuestionCard";
import TextArea from "../ui/form/input/TextArea";
import { useCoreValueManager } from "@/hooks/useCoreValueManager";
import { useCompanyProfileStore } from "@/stores/useCompanyProfileStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToastStore } from "@/stores/useToastStore";

export default function CoreValues() {
  const { isOpen, openModal, closeModal } = useModal();

  const values = useCompanyStore((state) => state.coreValues);
  const companyId = useCompanyStore((state) => state.companyId);
  const updateToBackend = useCompanyProfileStore(
    (state) => state.updateToBackend
  );

  const {
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
    setCoreValues,
  } = useCoreValueManager();
  const showToast = useToastStore((state) => state.showToast);

  const handleSave = async () => {
    await updateToBackend(companyId, {
      coreValues: coreValues.map((data) => ({
        name: data.name,
        description: data.description,
      })),
    });
    showToast({
      type: "success",
      message: "Core values updated successfully",
      title: "Success",
    });
    closeModal();
  };
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Core Values
            </h4>

            {/* Add mission here */}
            <ul className="flex flex-col ">
              {values.map((data) => (
                <li
                  className="flex items-center gap-2 py-2.5 text-gray-500 last:border-b-0 dark:border-gray-800 dark:text-gray-400"
                  key={data.id}
                >
                  <span className="ml-2 block h-[3px] w-[3px] rounded-full bg-gray-500 dark:bg-gray-400"></span>
                  <span>
                    {" "}
                    {data.name} - {data.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => {
              setCoreValues(
                values.map((value) => ({ ...value, id: value.id || "" }))
              );
              openModal();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Core Values
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your core values to ensure they align with your company's
              growth and direction.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="w-full flex flex-col gap-3 mx-auto text-base text-gray-700 dark:text-gray-400 sm:text-lg mb-10">
              {coreValues.map((data, index) => (
                <QuestionCard
                  id={`core-${index}`}
                  key={`core-${index}`}
                  title={`${data.name} - ${data.description}`}
                  deleteQuestion={() => {
                    selectCoreValue(index);
                    removeCoreValue(index);
                  }}
                  edit={() => {
                    selectCoreValue(index);
                    setIsEditCoreValueModalOpen(true);
                    setCoreValue(getCoreValue(index));
                  }}
                  view={() => {
                    selectCoreValue(index);
                    setIsViewCoreValueModalOpen(true);
                    setCoreValue(getCoreValue(index));
                  }}
                />
              ))}
              <Button
                variant="outline"
                className="h-[44px] flex gap-3"
                onClick={() => setIsNewCoreValueModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add core value
              </Button>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={
          isNewCoreValueModalOpen ||
          isEditCoreValueModalOpen ||
          isViewCoreValueModalOpen
        }
        onClose={() => {
          closeAllModals();
          setCoreValue({ id: "", name: "", description: "" });
        }}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {isNewCoreValueModalOpen
                ? "Add"
                : isEditCoreValueModalOpen
                ? "Edit"
                : "View"}{" "}
              core value
            </h4>
          </div>
          <div className="flex flex-col mt-7">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Core Value</Label>
                  <Input
                    placeholder="Enter core value"
                    value={coreValue.name}
                    onChange={(e) =>
                      setCoreValue((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    disabled={isViewCoreValueModalOpen}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <TextArea
                    placeholder="Enter core value description"
                    value={coreValue.description}
                    onChange={(value) =>
                      setCoreValue((prev) => ({ ...prev, description: value }))
                    }
                    disabled={isViewCoreValueModalOpen}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // closeQuestionModal();
                  // clearQuestion();
                  closeAllModals();
                  setCoreValue({ id: "", name: "", description: "" });
                }}
              >
                Close
              </Button>
              {!isViewCoreValueModalOpen && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (isEditCoreValueModalOpen) {
                      editCoreValue(coreValue.id, {
                        name: coreValue.name,
                        description: coreValue.description,
                      });
                      setCoreValue({ id: "", name: "", description: "" });
                    } else {
                      addCoreValue(coreValue);
                      setCoreValue({ id: "", name: "", description: "" });
                    }
                    closeAllModals();
                  }}
                  disabled={!coreValue.name || !coreValue.description}
                >
                  {isEditCoreValueModalOpen ? "Update" : "Add"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
