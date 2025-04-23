"use client";
import React, { useEffect, useState } from "react";
import ComponentCard from "../ui/common/ComponentCard";
import {
  ChevronDown,
  Loader,
  Percent,
  Plus,
  PuzzleIcon,
  Sparkle,
} from "lucide-react";
import { Modal } from "../ui/modal";
import Label from "../ui/form/Label";
import TextArea from "../ui/form/input/TextArea";
import Button from "../ui/button/Button";
import Input from "../ui/form/input/InputField";
import Select from "../ui/form/Select";
import QuestionCard from "../ui/common/QuestionCard";
import { useAuthStore } from "@/stores-test/authStore";
import TemplateCard from "./TemplateCard";
import { useCompanyProfileStore } from "@/stores-test/profileStore";
import { usePagesDataStore } from "@/stores-test/pagesDataStore";
import { useShallow } from "zustand/shallow";
import { useTemplateForm } from "@/hooks-test/useTemplateForm";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { useTemplateStore } from "@/stores/useTemplateStore";
import MultiSelect from "../ui/form/MultiSelect";
import api from "@/lib/axios";
import { endpoints } from "@/lib/endpoint";
import { useToastStore } from "@/stores/useToastStore";

interface TemplatesProps {}

const Templates: React.FC<TemplatesProps> = () => {
  const {
    selectedTemplate,
    setSelectedTemplate,
    addTemplate,
    editTemplate,
    deleteTemplate,
    isNewTemplateModalOpen,
    openNewTemplateModal,
    isViewTemplateModalOpen,
    openViewTemplateModal,
    isEditTemplateModalOpen,
    openEditTemplateModal,
    closeTemplateModal,
    isWarningModalOpen,
    openWarningModal,
    closeWarningModal,
    isNewQuestionModalOpen,
    openNewQuestionModal,
    isViewQuestionModalOpen,
    openViewQuestionModal,
    isEditQuestionModalOpen,
    openEditQuestionModal,
    closeQuestionModal,
    isGenerateQuestionsModalOpen,
    openGenerateQuestionsModal,
    closeGenerateQuestionsModal,
    currentStep,
    nextStep,
    prevStep,
    reset,
  } = useTemplateStore();

  const {
    name,
    question,
    questions,
    metrics,
    totalMetricsWeights,
    setName,
    setQuestion,
    setQuestions,
    setMetrics,
    resetForm,
    addQuestion,
    editQuestion,
    deleteQuestion,
    clearQuestion,
    responseQualityWeight,
    cultureFitWeight,
    setResponseQualityWeight,
    setCultureFitWeight,
    totalOverallFitWeight,
    totalCultureFitCompositeWeight,
    missionWeight,
    visionWeight,
    cultureWeight,
    coreValuesWeight,
    setMissionWeight,
    setVisionWeight,
    setCultureWeight,
    setCoreValuesWeight,
    alignedWiths,
  } = useTemplateForm(selectedTemplate!);

  const { templates, coreValues } = useCompanyStore(
    useShallow(
      useShallow((state) => ({
        templates: state.templates,
        coreValues: state.coreValues,
      }))
    )
  );

  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const companyId = useCompanyStore((state) => state.companyId);
  const culture = useCompanyStore((state) => state.culture);
  const filteredTemplates = templates.filter((template) => {
    const searchLower = searchQuery.toLowerCase();
    return template.name.toLowerCase().includes(searchLower);
  });

  const clearState = () => {
    reset();
    resetForm();
  };

  const header = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Manage Templates
      </h3>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative">
          <button className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                fill="currentColor"
              ></path>
            </svg>
          </button>
          <input
            placeholder="Search..."
            className="dark:bg-dark-900 h-11 w-full rounded-xl border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-3.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={openNewTemplateModal}
          className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium text-white rounded-xl bg-brand-500 shadow-theme-xs hover:bg-brand-600 sm:w-auto"
        >
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.2502 4.99951C9.2502 4.5853 9.58599 4.24951 10.0002 4.24951C10.4144 4.24951 10.7502 4.5853 10.7502 4.99951V9.24971H15.0006C15.4148 9.24971 15.7506 9.5855 15.7506 9.99971C15.7506 10.4139 15.4148 10.7497 15.0006 10.7497H10.7502V15.0001C10.7502 15.4143 10.4144 15.7501 10.0002 15.7501C9.58599 15.7501 9.2502 15.4143 9.2502 15.0001V10.7497H5C4.58579 10.7497 4.25 10.4139 4.25 9.99971C4.25 9.5855 4.58579 9.24971 5 9.24971H9.2502V4.99951Z"
              fill=""
            ></path>
          </svg>
          New Interview Template
        </button>
      </div>
    </div>
  );
  return (
    <>
      <ComponentCard header={header}>
        {filteredTemplates.length === 0 ? (
          templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-6">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-300 dark:text-gray-600"
                >
                  <path
                    d="M60 0C26.8629 0 0 26.8629 0 60C0 93.1371 26.8629 120 60 120C93.1371 120 120 93.1371 120 60C120 26.8629 93.1371 0 60 0ZM60 110C32.3862 110 10 87.6138 10 60C10 32.3862 32.3862 10 60 10C87.6138 10 110 32.3862 110 60C110 87.6138 87.6138 110 60 110Z"
                    fill="currentColor"
                  />
                  <path
                    d="M60 20C38.9543 20 22 36.9543 22 58C22 79.0457 38.9543 96 60 96C81.0457 96 98 79.0457 98 58C98 36.9543 81.0457 20 60 20ZM60 86C43.4315 86 30 72.5685 30 56C30 39.4315 43.4315 26 60 26C76.5685 26 90 39.4315 90 56C90 72.5685 76.5685 86 60 86Z"
                    fill="currentColor"
                  />
                  <path
                    d="M60 40C47.8497 40 38 49.8497 38 62C38 74.1503 47.8497 84 60 84C72.1503 84 82 74.1503 82 62C82 49.8497 72.1503 40 60 40ZM60 74C53.3726 74 48 68.6274 48 62C48 55.3726 53.3726 50 60 50C66.6274 50 72 55.3726 72 62C72 68.6274 66.6274 74 60 74Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                No templates yet
              </h3>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Create your first interview template to start evaluating
                candidates based on your company's culture and values.
              </p>
              <button
                onClick={openNewTemplateModal}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-xl bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.2502 4.99951C9.2502 4.5853 9.58599 4.24951 10.0002 4.24951C10.4144 4.24951 10.7502 4.5853 10.7502 4.99951V9.24971H15.0006C15.4148 9.24971 15.7506 9.5855 15.7506 9.99971C15.7506 10.4139 15.4148 10.7497 15.0006 10.7497H10.7502V15.0001C10.7502 15.4143 10.4144 15.7501 10.0002 15.7501C9.58599 15.7501 9.2502 15.4143 9.2502 15.0001V10.7497H5C4.58579 10.7497 4.25 10.4139 4.25 9.99971C4.25 9.5855 4.58579 9.24971 5 9.24971H9.2502V4.99951Z"
                    fill=""
                  />
                </svg>
                Create New Template
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-6">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-300 dark:text-gray-600"
                >
                  <path
                    d="M113.1 99.2L93.6 79.6C99.9 71.2 103.5 60.5 103.5 48.9C103.5 22.3 82 0.7 55.4 0.7C28.8 0.7 7.3 22.3 7.3 48.9C7.3 75.5 28.8 97.1 55.4 97.1C67 97.1 77.7 93.5 86.1 87.2L105.6 106.8C106.8 108 108.3 108.6 109.9 108.6C111.5 108.6 113 108 114.2 106.8C116.6 104.3 116.6 101 113.1 99.2Z"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M55.4 18.2C38.6 18.2 24.8 32 24.8 48.8C24.8 65.6 38.6 79.4 55.4 79.4C72.2 79.4 86 65.6 86 48.8C86 32 72.3 18.2 55.4 18.2Z"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                No matches found
              </h3>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                No templates match your search query "{searchQuery}". Try
                different keywords or clear your search.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-xl bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="fill-current"
                >
                  <path
                    d="M9.2502 4.99951C9.2502 4.5853 9.58599 4.24951 10.0002 4.24951C10.4144 4.24951 10.7502 4.5853 10.7502 4.99951V9.24971H15.0006C15.4148 9.24971 15.7506 9.5855 15.7506 9.99971C15.7506 10.4139 15.4148 10.7497 15.0006 10.7497H10.7502V15.0001C10.7502 15.4143 10.4144 15.7501 10.0002 15.7501C9.58599 15.7501 9.2502 15.4143 9.2502 15.0001V10.7497H5C4.58579 10.7497 4.25 10.4139 4.25 9.99971C4.25 9.5855 4.58579 9.24971 5 9.24971H9.2502V4.99951Z"
                    fill=""
                    transform="rotate(45 10 10)"
                  />
                </svg>
                Clear Search
              </button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                template={template}
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  openViewTemplateModal();
                }}
                onEdit={() => {
                  const statuses = ["PENDING", "SUBMITTED", "PROCESSING", "EVALUATED"];
                  const count =
                    template.interviews?.filter((interview) =>
                      statuses.includes(interview.status)
                    ).length || 0;

                  if (count > 0) {
                    useToastStore.getState().showToast({
                      title: "Edit disabled",
                      message:
                        "This template cannot be edited because it's linked to existing interviews. Creating a new template instead.",
                      type: "warning",
                    });
                  } else {
                    setSelectedTemplate(template);
                    openEditTemplateModal();
                  }
                }}
                onDelete={() => {
                  const statuses = ["PENDING", "SUBMITTED", "PROCESSING", "EVALUATED"];
                  const count =
                    template.interviews?.filter((interview) =>
                      statuses.includes(interview.status)
                    ).length || 0;

                  if (count > 0) {
                    useToastStore.getState().showToast({
                      title: "Delete disabled",
                      message:
                        "This template cannot be deleted because it contains linked interview data. This restriction preserves the integrity of your interview records.",
                      type: "warning",
                    });
                  } else {
                    openWarningModal();
                    setSelectedTemplate(template);
                  }
                }}
              />
            ))}
          </div>
        )}
      </ComponentCard>
      <Modal
        isOpen={isViewTemplateModalOpen || isEditTemplateModalOpen}
        onClose={clearState}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {isViewTemplateModalOpen ? "View" : "Edit"} interview template
            </h4>
          </div>
          <div className="h-[650px] no-scrollbar flex-auto overflow-scroll">
            <div className="flex flex-col gap-6">
              <div className="px-2 overflow-y-auto custom-scrollbar">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isViewTemplateModalOpen}
                  />
                </div>
              </div>
              <div className="px-2 flex flex-col gap-3">
                <div>
                  <Label className="text-base">Questions</Label>
                  {isEditTemplateModalOpen && (
                    <Label>
                      Add questions that reflect your company's mission, vision,
                      culture, or values. These will be asked during the
                      interview.
                    </Label>
                  )}
                </div>
                <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto custom-scrollbar">
                  {questions.map((question) => (
                    <QuestionCard
                      id={question.id!}
                      key={question.id}
                      title={question.questionText}
                      deleteQuestion={() => deleteQuestion(question.id!)}
                      edit={() => {
                        setQuestion(
                          questions.find((q) => q.id === question.id)!
                        );
                        openEditQuestionModal();
                      }}
                      view={() => {
                        setQuestion(
                          questions.find((q) => q.id === question.id)!
                        );
                        openViewQuestionModal();
                      }}
                      isView={isViewTemplateModalOpen}
                    />
                  ))}
                </div>
                {isEditTemplateModalOpen && (
                  <Button
                    variant="outline"
                    className="h-[44px] flex gap-3"
                    onClick={openNewQuestionModal}
                    disabled={isViewTemplateModalOpen}
                  >
                    <Plus className="h-4 w-4" />
                    Add question
                  </Button>
                )}
              </div>

              <div className="px-2 flex flex-col gap-3">
                <div>
                  <Label className="text-base">Response Quality Weights</Label>
                  {isEditTemplateModalOpen && (
                    <Label>
                      Adjust the importance of each metric. Total should equal
                      100%.
                    </Label>
                  )}
                </div>
                {metrics.map((metric) => (
                  <div className="w-full flex flex-col gap-3" key={metric.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1 justify-center">
                        <Label className="m-0">{metric.name}</Label>
                        <Label className="m-0 font-normal text-xs">
                          {metric.description}
                        </Label>
                      </div>
                      <div className="relative w-[70px]">
                        <Input
                          className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          type="number"
                          min="0"
                          max="100"
                          value={metric.weight}
                          onChange={(e) =>
                            setMetrics((prev) =>
                              prev.map((m) =>
                                m.id === metric.id
                                  ? { ...m, weight: parseInt(e.target.value) }
                                  : m
                              )
                            )
                          }
                          disabled={isViewTemplateModalOpen}
                        />
                        <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      className="accent-brand-500 [&:disabled]:accent-brand-500"
                      value={metric.weight}
                      onChange={(e) =>
                        setMetrics((prev) =>
                          prev.map((m) =>
                            m.id === metric.id
                              ? { ...m, weight: parseInt(e.target.value) }
                              : m
                          )
                        )
                      }
                      disabled={isViewTemplateModalOpen}
                    />
                  </div>
                ))}
              </div>
              {isEditTemplateModalOpen && (
                <p
                  className={`mb-1.5 block text-sm font-medium  px-2 ${
                    totalMetricsWeights !== 100
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {totalMetricsWeights !== 100
                    ? `Total weight is ${totalMetricsWeights}%. Please make sure it adds up to 100%.`
                    : "All good! Metric weights are properly distributed."}
                </p>
              )}

              <div className="px-2 flex flex-col gap-3">
                <div>
                  <Label className="text-base">
                    Culture Fit Composite Weights
                  </Label>
                  {isEditTemplateModalOpen && (
                    <Label>
                      Adjust the importance of each metric. Total should equal
                      100%.
                    </Label>
                  )}
                </div>
                {alignedWiths.includes("MISSION") && (
                  <div className="w-full flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1 justify-center">
                        <Label className="m-0">Mission Alignment</Label>
                        <Label className="m-0 font-normal text-xs">
                          Describes the quality of the candidate's response.
                        </Label>
                      </div>
                      <div className="relative w-[70px]">
                        <Input
                          className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          type="number"
                          min="0"
                          max="100"
                          value={missionWeight}
                          onChange={(e) =>
                            setMissionWeight(parseInt(e.target.value))
                          }
                          disabled={isViewTemplateModalOpen}
                        />
                        <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      className="accent-brand-500 [&:disabled]:accent-brand-500"
                      value={missionWeight}
                      onChange={(e) =>
                        setMissionWeight(parseInt(e.target.value))
                      }
                      disabled={isViewTemplateModalOpen}
                    />
                  </div>
                )}
                {alignedWiths.includes("VISION") && (
                  <div className="w-full flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1 justify-center">
                        <Label className="m-0">Vision Alignment</Label>
                        <Label className="m-0 font-normal text-xs">
                          Describes the cultural fit of the candidate.
                        </Label>
                      </div>
                      <div className="relative w-[70px]">
                        <Input
                          className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          type="number"
                          min="0"
                          max="100"
                          value={visionWeight}
                          onChange={(e) =>
                            setVisionWeight(parseInt(e.target.value))
                          }
                          disabled={isViewTemplateModalOpen}
                        />
                        <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      className="accent-brand-500 [&:disabled]:accent-brand-500"
                      value={visionWeight}
                      onChange={(e) =>
                        setVisionWeight(parseInt(e.target.value))
                      }
                      disabled={isViewTemplateModalOpen}
                    />
                  </div>
                )}
                {alignedWiths.includes("CULTURE") && (
                  <div className="w-full flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1 justify-center">
                        <Label className="m-0">Culture Alignment</Label>
                        <Label className="m-0 font-normal text-xs">
                          Describes the cultural fit of the candidate.
                        </Label>
                      </div>
                      <div className="relative w-[70px]">
                        <Input
                          className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          type="number"
                          min="0"
                          max="100"
                          value={cultureWeight}
                          onChange={(e) =>
                            setCultureWeight(parseInt(e.target.value))
                          }
                          disabled={isViewTemplateModalOpen}
                        />
                        <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      className="accent-brand-500 [&:disabled]:accent-brand-500"
                      value={cultureWeight}
                      onChange={(e) =>
                        setCultureWeight(parseInt(e.target.value))
                      }
                      disabled={isViewTemplateModalOpen}
                    />
                  </div>
                )}
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1 justify-center">
                      <Label className="m-0">Core Values Alignment</Label>
                      <Label className="m-0 font-normal text-xs">
                        Describes the cultural fit of the candidate.
                      </Label>
                    </div>
                    <div className="relative w-[70px]">
                      <Input
                        className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        min="0"
                        max="100"
                        value={coreValuesWeight}
                        onChange={(e) =>
                          setCoreValuesWeight(parseInt(e.target.value))
                        }
                        disabled={isViewTemplateModalOpen}
                      />
                      <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    className="accent-brand-500 [&:disabled]:accent-brand-500"
                    value={coreValuesWeight}
                    onChange={(e) =>
                      setCoreValuesWeight(parseInt(e.target.value))
                    }
                    disabled={isViewTemplateModalOpen}
                  />
                </div>
                {isEditTemplateModalOpen && (
                  <p
                    className={`mb-1.5 block text-sm font-medium  px-2 ${
                      totalCultureFitCompositeWeight !== 100
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {totalCultureFitCompositeWeight !== 100
                      ? `Total weight is ${totalCultureFitCompositeWeight}%. Please make sure it adds up to 100%.`
                      : "All good! Metric weights are properly distributed."}
                  </p>
                )}
              </div>

              <div className="px-2 flex flex-col gap-3">
                <div>
                  <Label className="text-base">Overall Fit Score Weights</Label>
                  {isEditTemplateModalOpen && (
                    <Label>
                      Adjust the importance of each metric. Total should equal
                      100%.
                    </Label>
                  )}
                </div>
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1 justify-center">
                      <Label className="m-0">Response Quality</Label>
                      <Label className="m-0 font-normal text-xs">
                        Describes the quality of the candidate's response.
                      </Label>
                    </div>
                    <div className="relative w-[70px]">
                      <Input
                        className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        min="0"
                        max="100"
                        value={responseQualityWeight}
                        onChange={(e) =>
                          setResponseQualityWeight(parseInt(e.target.value))
                        }
                        disabled={isViewTemplateModalOpen}
                      />
                      <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    className="accent-brand-500 [&:disabled]:accent-brand-500"
                    value={responseQualityWeight}
                    onChange={(e) =>
                      setResponseQualityWeight(parseInt(e.target.value))
                    }
                    disabled={isViewTemplateModalOpen}
                  />
                </div>
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1 justify-center">
                      <Label className="m-0">Culture Fit</Label>
                      <Label className="m-0 font-normal text-xs">
                        Describes the cultural fit of the candidate.
                      </Label>
                    </div>
                    <div className="relative w-[70px]">
                      <Input
                        className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        min="0"
                        max="100"
                        value={cultureFitWeight}
                        onChange={(e) =>
                          setCultureFitWeight(parseInt(e.target.value))
                        }
                        disabled={isViewTemplateModalOpen}
                      />
                      <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    className="accent-brand-500 [&:disabled]:accent-brand-500"
                    value={cultureFitWeight}
                    onChange={(e) =>
                      setCultureFitWeight(parseInt(e.target.value))
                    }
                    disabled={isViewTemplateModalOpen}
                  />
                </div>
                {isEditTemplateModalOpen && (
                  <p
                    className={`mb-1.5 block text-sm font-medium  px-2 ${
                      totalOverallFitWeight !== 100
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {totalOverallFitWeight !== 100
                      ? `Total weight is ${totalOverallFitWeight}%. Please make sure it adds up to 100%.`
                      : "All good! Metric weights are properly distributed."}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 px-2 lg:justify-end">
                <Button size="sm" variant="outline" onClick={clearState}>
                  Close
                </Button>
                {isEditTemplateModalOpen && (
                  <Button
                    size="sm"
                    onClick={() => {
                      editTemplate({
                        name,
                        metrics: metrics.map((metric) => ({
                          name: metric.name,
                          description: metric.description,
                          weight: metric.weight,
                        })),
                        questions: questions.map((question) => ({
                          questionText: question.questionText,
                          order: question.order,
                          coreValues: question.coreValues,
                          alignedWith: question.alignedWith,
                        })),
                        responseQualityWeight: responseQualityWeight,
                        cultureFitWeight: cultureFitWeight,
                        missionWeight: missionWeight,
                        visionWeight: visionWeight,
                        cultureWeight: cultureWeight,
                        coreValuesWeight: coreValuesWeight,
                      });
                      clearState();
                    }}
                    disabled={totalMetricsWeights !== 100}
                  >
                    Update
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isNewTemplateModalOpen && currentStep === 1}
        onClose={clearState}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create interview template
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create a question set with customizable metrics to evaluate
              candidates based on your culture and values. You can reuse this
              across multiple interviews.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  closeTemplateModal();
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={nextStep} disabled={!name}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isNewTemplateModalOpen && currentStep === 2}
        onClose={clearState}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create interview template
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create a question set with customizable metrics to evaluate
              candidates based on your culture and values. You can reuse this
              across multiple roles.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="px-2 flex flex-col gap-3">
              <div>
                <Label className="text-base">Interview Questions</Label>
                <Label>
                  Add questions linked to your company's core values and aligned
                  with either its mission, vision, or culture.
                </Label>
              </div>
              <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto custom-scrollbar relative">
                {questions.map((question) => (
                  <QuestionCard
                    id={question.id!}
                    key={question.id}
                    title={question.questionText}
                    deleteQuestion={() => deleteQuestion(question.id!)}
                    edit={() => {
                      setQuestion(questions.find((q) => q.id === question.id)!);
                      openEditQuestionModal();
                    }}
                    view={() => {
                      setQuestion(questions.find((q) => q.id === question.id)!);
                      openViewQuestionModal();
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="h-[44px] flex gap-3 flex-1"
                  onClick={openNewQuestionModal}
                >
                  <Plus className="h-4 w-4" />
                  Add question
                </Button>
                <Button
                  className="h-[44px] flex gap-3 flex-1"
                  onClick={openGenerateQuestionsModal}
                  disabled={isGeneratingQuestions}
                >
                  {isGeneratingQuestions ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkle className="h-4 w-4" />
                  )}
                  {isGeneratingQuestions
                    ? "Generating..."
                    : "Generate Questions"}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button
                size="sm"
                onClick={nextStep}
                disabled={questions.length === 0 || isGeneratingQuestions}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isNewTemplateModalOpen && currentStep === 3}
        onClose={clearState}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create interview template
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create a question set with customizable metrics to evaluate
              candidates based on your culture and values. You can reuse this
              across multiple interviews.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="px-2 flex flex-col gap-3">
              <div>
                <Label className="text-base">Response Quality Weights</Label>
                <Label>
                  Customize how much each metric affects candidate evaluation
                  (30% of total fit score).
                </Label>
              </div>
              {metrics.map((metric) => (
                <div className="w-full flex flex-col gap-3" key={metric.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1 justify-center">
                      <Label className="m-0">{metric.name}</Label>
                      <Label className="m-0 font-normal text-xs">
                        {metric.description}
                      </Label>
                    </div>
                    <div className="relative w-[70px]">
                      <Input
                        className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        min="0"
                        max="100"
                        value={metric.weight}
                        onChange={(e) =>
                          setMetrics((prev) =>
                            prev.map((m) =>
                              m.id === metric.id
                                ? { ...m, weight: parseInt(e.target.value) }
                                : m
                            )
                          )
                        }
                      />
                      <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    className="accent-brand-500"
                    value={metric.weight}
                    onChange={(e) =>
                      setMetrics((prev) =>
                        prev.map((m) =>
                          m.id === metric.id
                            ? { ...m, weight: parseInt(e.target.value) }
                            : m
                        )
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <p
              className={`mb-1.5 block text-sm font-medium  px-2 ${
                totalMetricsWeights !== 100 ? "text-red-500" : "text-green-500"
              }`}
            >
              {totalMetricsWeights !== 100
                ? `Total weight is ${totalMetricsWeights}%. Please make sure it adds up to 100%.`
                : "All good! Metric weights are properly distributed."}
            </p>
            <div className="flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button
                size="sm"
                onClick={nextStep}
                disabled={totalMetricsWeights !== 100}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isNewTemplateModalOpen && currentStep === 4}
        onClose={clearState}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create interview template
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create a question set with customizable metrics to evaluate
              candidates based on your culture and values. You can reuse this
              across multiple interviews.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="px-2 flex flex-col gap-3">
              <div>
                <Label className="text-base">
                  Culture Fit Composite Weights
                </Label>
                <Label>
                  Customize how much each metric affects candidate evaluation
                </Label>
              </div>
              {alignedWiths.includes("MISSION") && (
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1 justify-center">
                      <Label className="m-0">Mission</Label>
                      <Label className="m-0 font-normal text-xs">
                        Aligns with the company's mission.
                      </Label>
                    </div>
                    <div className="relative w-[70px]">
                      <Input
                        className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        min="0"
                        max="100"
                        value={missionWeight}
                        onChange={(e) =>
                          setMissionWeight(parseInt(e.target.value))
                        }
                      />
                      <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    className="accent-brand-500"
                    value={missionWeight}
                    onChange={(e) => setMissionWeight(parseInt(e.target.value))}
                  />
                </div>
              )}
              {alignedWiths.includes("VISION") && (
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1 justify-center">
                      <Label className="m-0">Vision</Label>
                      <Label className="m-0 font-normal text-xs">
                        Aligns with the company's vision.
                      </Label>
                    </div>
                    <div className="relative w-[70px]">
                      <Input
                        className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        min="0"
                        max="100"
                        value={visionWeight}
                        onChange={(e) =>
                          setVisionWeight(parseInt(e.target.value))
                        }
                      />
                      <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    className="accent-brand-500"
                    value={visionWeight}
                    onChange={(e) => setVisionWeight(parseInt(e.target.value))}
                  />
                </div>
              )}
              {alignedWiths.includes("CULTURE") && (
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1 justify-center">
                      <Label className="m-0">Culture</Label>
                      <Label className="m-0 font-normal text-xs">
                        Aligns with the company's culture.
                      </Label>
                    </div>
                    <div className="relative w-[70px]">
                      <Input
                        className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        min="0"
                        max="100"
                        value={cultureWeight}
                        onChange={(e) =>
                          setCultureWeight(parseInt(e.target.value))
                        }
                      />
                      <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    className="accent-brand-500"
                    value={cultureWeight}
                    onChange={(e) => setCultureWeight(parseInt(e.target.value))}
                  />
                </div>
              )}
              <div className="w-full flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 justify-center">
                    <Label className="m-0">Core Values</Label>
                    <Label className="m-0 font-normal text-xs">
                      Aligns with the company's core values.
                    </Label>
                  </div>
                  <div className="relative w-[70px]">
                    <Input
                      className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      type="number"
                      min="0"
                      max="100"
                      value={coreValuesWeight}
                      onChange={(e) =>
                        setCoreValuesWeight(parseInt(e.target.value))
                      }
                    />
                    <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  className="accent-brand-500"
                  value={coreValuesWeight}
                  onChange={(e) =>
                    setCoreValuesWeight(parseInt(e.target.value))
                  }
                />
              </div>
            </div>
            <p
              className={`mb-1.5 block text-sm font-medium  px-2 ${
                totalCultureFitCompositeWeight !== 100
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {totalCultureFitCompositeWeight !== 100
                ? `Total weight is ${totalCultureFitCompositeWeight}%. Please make sure it adds up to 100%.`
                : "All good! Metric weights are properly distributed."}
            </p>
            <div className="flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button
                size="sm"
                onClick={nextStep}
                disabled={totalCultureFitCompositeWeight !== 100}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isNewTemplateModalOpen && currentStep === 5}
        onClose={clearState}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create interview template
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create a question set with customizable metrics to evaluate
              candidates based on your culture and values. You can reuse this
              across multiple interviews.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="px-2 flex flex-col gap-3">
              <div>
                <Label className="text-base">Overall Fit Score</Label>
                <Label>
                  Customize how much each metric affects candidate evaluation
                </Label>
              </div>
              <div className="w-full flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 justify-center">
                    <Label className="m-0">Response Quality</Label>
                    <Label className="m-0 font-normal text-xs">
                      Response quality
                    </Label>
                  </div>
                  <div className="relative w-[70px]">
                    <Input
                      className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      type="number"
                      min="0"
                      max="100"
                      value={responseQualityWeight}
                      onChange={(e) =>
                        setResponseQualityWeight(parseFloat(e.target.value))
                      }
                    />
                    <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  className="accent-brand-500"
                  value={responseQualityWeight}
                  onChange={(e) =>
                    setResponseQualityWeight(parseFloat(e.target.value))
                  }
                />
              </div>
              <div className="w-full flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 justify-center">
                    <Label className="m-0">Culture Fit</Label>
                    <Label className="m-0 font-normal text-xs">
                      Culture Fit
                    </Label>
                  </div>
                  <div className="relative w-[70px]">
                    <Input
                      className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      type="number"
                      min="0"
                      max="100"
                      value={cultureFitWeight}
                      onChange={(e) =>
                        setCultureFitWeight(parseFloat(e.target.value))
                      }
                    />
                    <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  className="accent-brand-500"
                  value={cultureFitWeight}
                  onChange={(e) =>
                    setCultureFitWeight(parseFloat(e.target.value))
                  }
                />
              </div>
            </div>
            <p
              className={`mb-1.5 block text-sm font-medium  px-2 ${
                totalOverallFitWeight !== 100
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {totalOverallFitWeight !== 100
                ? `Total weight is ${totalOverallFitWeight}%. Please make sure it adds up to 100%.`
                : "All good! Metric weights are properly distributed."}
            </p>
            <div className="flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  addTemplate({
                    name: name,
                    companyId: "cm8l7il910007vgi8ano9wwz1",
                    questions: questions.map(({ id, ...rest }) => rest),
                    metrics: metrics.map(({ id, ...rest }) => rest),
                    responseQualityWeight: responseQualityWeight,
                    cultureFitWeight: cultureFitWeight,
                    missionWeight: missionWeight,
                    visionWeight: visionWeight,
                    cultureWeight: cultureWeight,
                    coreValuesWeight: coreValuesWeight,
                  });
                  clearState();
                }}
                disabled={totalOverallFitWeight !== 100}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={
          isNewQuestionModalOpen ||
          isViewQuestionModalOpen ||
          isEditQuestionModalOpen
        }
        onClose={() => {
          closeQuestionModal();
          clearQuestion();
        }}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {isNewQuestionModalOpen
                ? "Add"
                : isEditQuestionModalOpen
                ? "Edit"
                : "View"}{" "}
              question
            </h4>
          </div>
          <div className="flex flex-col mt-7">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2">
                  <Label>Question</Label>
                  <TextArea
                    value={question.questionText}
                    onChange={(value) =>
                      setQuestion((prev) => ({
                        ...prev,
                        questionText: value,
                      }))
                    }
                    disabled={isViewQuestionModalOpen}
                  />
                </div>

                <div className="col-span-2">
                  <MultiSelect
                    label="Evaluates"
                    options={coreValues.map((coreValue) => ({
                      value: `${coreValue.id}-${coreValue.name}`,
                      text: coreValue.name,
                      selected: false,
                    }))}
                    defaultSelected={coreValues
                      .filter((cv) =>
                        question.coreValues.split(",").includes(cv.name)
                      )
                      .map((cv) => `${cv.id}-${cv.name}`)}
                    onChange={(values) =>
                      setQuestion((prev) => ({
                        ...prev,
                        coreValues: values
                          .map((v) => v.split("-")[1])
                          .join(","),
                      }))
                    }
                    disabled={isViewQuestionModalOpen}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Aligned with</Label>
                  <div className="relative">
                    <Select
                      options={[
                        { value: "MISSION", label: "Mission" },
                        { value: "VISION", label: "Vision" },
                        {
                          value: "CULTURE",
                          label: `Culture${
                            !culture
                              ? " (Set company culture on settings to select this.)"
                              : ""
                          }`,
                          disabled: !culture,
                        },
                      ].filter(
                        (option): option is { value: string; label: string } =>
                          option !== undefined
                      )}
                      onChange={(value) =>
                        setQuestion((prev) => ({
                          ...prev,
                          alignedWith: value,
                        }))
                      }
                      defaultValue={question.alignedWith}
                      disabled={isViewQuestionModalOpen}
                    />
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  closeQuestionModal();
                  clearQuestion();
                }}
              >
                Close
              </Button>
              {!isViewQuestionModalOpen && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (isEditQuestionModalOpen) {
                      editQuestion(question);
                    } else {
                      addQuestion(question);
                    }
                    closeQuestionModal();
                  }}
                  disabled={
                    !question.questionText ||
                    !question.coreValues ||
                    !question.alignedWith
                  }
                >
                  {isEditQuestionModalOpen ? "Update" : "Add"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isWarningModalOpen}
        onClose={closeWarningModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <div className="relative flex items-center justify-center z-1 mb-7">
            <svg
              className="fill-error-50 dark:fill-error-500/15"
              width="90"
              height="90"
              viewBox="0 0 90 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
                fill=""
                fillOpacity=""
              />
            </svg>

            <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <svg
                className="fill-error-600 dark:fill-error-500"
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.62684 11.7496C9.04105 11.1638 9.04105 10.2141 9.62684 9.6283C10.2126 9.04252 11.1624 9.04252 11.7482 9.6283L18.9985 16.8786L26.2485 9.62851C26.8343 9.04273 27.7841 9.04273 28.3699 9.62851C28.9556 10.2143 28.9556 11.164 28.3699 11.7498L21.1198 18.9999L28.3699 26.25C28.9556 26.8358 28.9556 27.7855 28.3699 28.3713C27.7841 28.9571 26.8343 28.9571 26.2485 28.3713L18.9985 21.1212L11.7482 28.3715C11.1624 28.9573 10.2126 28.9573 9.62684 28.3715C9.04105 27.7857 9.04105 26.836 9.62684 26.2502L16.8771 18.9999L9.62684 11.7496Z"
                  fill=""
                />
              </svg>
            </span>
          </div>

          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
            Danger Alert!
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            This action will permanently delete the template and all related
            questions, metrics, and data associated with it. This cannot be
            undone.
          </p>

          <div className="flex items-center justify-center w-full gap-3 mt-7">
            <button
              type="button"
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
              onClick={deleteTemplate}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isGenerateQuestionsModalOpen}
        onClose={() => {
          closeGenerateQuestionsModal();
          setNumberOfQuestions(1);
        }}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Generate Questions
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter the number of questions you want to generate based on your
              company's core values.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div>
                <Label>Number of Questions (10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfQuestions}
                  onChange={(e) => {
                    const value = e.target.value;

                    // 1. Explicitly check if the input field has been cleared
                    if (value === "") {
                      // 2. Set the state to a sensible default (e.g., 0)
                      // This prevents the state from being stuck on the previous value
                      // or becoming inconsistent with the empty input.
                      setNumberOfQuestions(1);

                      // --- Alternative: Set to null ---
                      // If you prefer the state to be null when empty, use this instead:
                      // setNumberOfQuestions(null);
                      // Make sure the rest of your component logic can handle null.
                    } else {
                      // 3. If not empty, proceed with parsing and validation
                      const number = parseInt(value, 10); // Use radix 10

                      // 4. Update state only if it's a valid number
                      // (Add other checks like number >= 0 if necessary)
                      if (!Number.isNaN(number)) {
                        setNumberOfQuestions(number);
                      }
                      // If input is not empty but invalid (e.g., "abc"),
                      // NaN is produced, and the state won't update here.
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={closeGenerateQuestionsModal}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    closeGenerateQuestionsModal();
                    setIsGeneratingQuestions(true);
                    const { data } = await api.post(
                      endpoints.templates.generateQuestions(companyId),
                      { numberOfQuestions },
                      {
                        withCredentials: true,
                      }
                    );
                    setIsGeneratingQuestions(false);
                    const processedQuestions = data.map((question: any) => ({
                      id: crypto.randomUUID(),
                      ...question,
                    }));
                    setQuestions((prev) => [...prev, ...processedQuestions]);
                  } catch (error) {
                    setIsGeneratingQuestions(false);
                    closeGenerateQuestionsModal();
                    useToastStore.getState().showToast({
                      title: "Error",
                      message: "Error generating questions. Please try again.",
                      type: "error",
                    });
                  }
                }}
                disabled={numberOfQuestions < 1 || numberOfQuestions > 10}
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Templates;
