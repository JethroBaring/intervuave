"use client";

import { useOnboardingSteps } from "@/hooks/useOnboardingStep";
import Button from "../ui/button/Button";
import GridShape from "../ui/common/GridShape";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, Loader, Plus } from "lucide-react";
import Label from "../ui/form/Label";
import TextArea from "../ui/form/input/TextArea";
import Input from "../ui/form/input/InputField";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks-test/useModal";
import QuestionCard from "../ui/common/QuestionCard";
import { useEffect, useState } from "react";
import { useCompanyStore } from "@/stores/useCompanyStore";

const OnBoarding = () => {
  const {
    currentStep,
    nextStep,
    prevStep,
    isLastStep,
    isFirstStep,
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
  } = useOnboardingSteps(6);

  const [submitting, isSubmitting] = useState(false);

  const isOnboarding = useCompanyStore((state) => state.isOnboarding);
  const router = useRouter();

  useEffect(() => {
    if (!isOnboarding) {
      router.push("/dashboard");
    }
  }, [isOnboarding]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />
      {currentStep === 1 && (
        <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
          <div className="flex items-center justify-center">
            <Image
              height={75}
              width={75}
              alt="logo"
              src={"/images/intervuave.png"}
            />
          </div>
          <h1 className="mt-6 mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
            Welcome to Intervuave
          </h1>
          <p className="mt-6 mb-5 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            Build a stronger team by evaluating candidates based on your
            company's unique culture and values
          </p>
          <div className="flex flex-col gap-3 w-fit mx-auto text-base text-gray-700 dark:text-gray-400 sm:text-lg mb-10">
            <div className="flex gap-5 items-center">
              <Check className="h-5 w-5 text-brand-400" />
              <p>Create structured interview evaluations</p>
            </div>
            <div className="flex gap-5 items-center">
              <Check className="h-5 w-5 text-brand-400" />
              <p>Align hiring with your company values</p>
            </div>
            <div className="flex gap-5 items-center">
              <Check className="h-5 w-5 text-brand-400" />
              <p>Make objective, data-driven decisions</p>
            </div>
          </div>
          <Button onClick={nextStep}>Get Started</Button>
        </div>
      )}
      {currentStep === 2 && (
        <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
          <div className="flex items-center justify-center">
            <Image
              height={75}
              width={75}
              alt="logo"
              src={"/images/intervuave.png"}
            />
          </div>
          <h1 className="mt-6 mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
            Mission
          </h1>
          <p className="mt-6 mb-5 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            Define your company's mission, vision, and culture to help evaluate
            candidates who align with your long-term goals.
          </p>
          <div className="flex flex-col gap-3 mx-auto text-base text-gray-700 dark:text-gray-400 sm:text-lg mb-10">
            <div>
              <Label className="text-lg text-start">Mission Statement</Label>
              <TextArea
                placeholder="Enter your company's mission"
                value={data.mission}
                onChange={(value) => updateData({ mission: value })}
                // value={draftMission}
                // onChange={(value) => setDraftMission(value)}
              />
            </div>
          </div>
          <div className="flex gap-5 justify-center">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={nextStep} disabled={!data.mission}>
              Continue
            </Button>
          </div>
        </div>
      )}
      {currentStep === 3 && (
        <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
          <div className="flex items-center justify-center">
            <Image
              height={75}
              width={75}
              alt="logo"
              src={"/images/intervuave.png"}
            />
          </div>
          <h1 className="mt-6 mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
            Vision
          </h1>
          <p className="mt-6 mb-5 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            Define your company's mission, vision, and culture to help evaluate
            candidates who align with your long-term goals.
          </p>
          <div className="flex flex-col gap-3 mx-auto text-base text-gray-700 dark:text-gray-400 sm:text-lg mb-10">
            <div>
              <Label className="text-lg text-start">Vision Statement</Label>
              <TextArea
                placeholder="Enter your company's mission"
                value={data.vision}
                onChange={(value) => updateData({ vision: value })}
              />
            </div>
          </div>
          <div className="flex gap-5 justify-center">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={nextStep} disabled={!data.vision}>
              Continue
            </Button>
          </div>
        </div>
      )}
      {currentStep === 4 && (
        <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
          <div className="flex items-center justify-center">
            <Image
              height={75}
              width={75}
              alt="logo"
              src={"/images/intervuave.png"}
            />
          </div>
          <h1 className="mt-6 mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
            Culture
          </h1>
          <p className="mt-6 mb-5 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            Define your company's mission, vision, and culture to help evaluate
            candidates who align with your long-term goals.
          </p>
          <div className="flex flex-col gap-3 mx-auto text-base text-gray-700 dark:text-gray-400 sm:text-lg mb-10">
            <div>
              <Label className="text-lg text-start">Culture Statement</Label>
              <TextArea
                placeholder="Enter your company's culture"
                value={data.culture}
                onChange={(value) => updateData({ culture: value })}
              />
            </div>
          </div>
          <div className="flex gap-5 justify-center">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={nextStep} disabled={!data.culture}>
              Continue
            </Button>
          </div>
        </div>
      )}
      {currentStep === 5 && (
        <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
          <div className="flex items-center justify-center">
            <Image
              height={75}
              width={75}
              alt="logo"
              src={"/images/intervuave.png"}
            />
          </div>
          <h1 className="mt-6 mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
            Core Values
          </h1>
          <p className="mt-6 mb-5 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            Define the core values that drive your company. These will be used
            to evaluate cultural alignment during interviews.
          </p>
          <div className="flex flex-col gap-3 mx-auto text-base text-gray-700 dark:text-gray-400 sm:text-lg mb-10">
            {data.coreValues.map((data, index) => (
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
          <div className="flex gap-5 justify-center">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button
              onClick={async () => {
                isSubmitting(true);
                await submit();
                nextStep();
                isSubmitting(false);
              }}
              disabled={data.coreValues.length === 0}
            >
              {submitting && <Loader className="h-5 w-5 animate-spin" />}
              Submit
            </Button>
          </div>
        </div>
      )}

      {currentStep === 6 && (
        <>
          <Check className="text-brand-400 h-48 w-48" />
          <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
            <h1 className="mt-6 mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
              You're All Set!
            </h1>
            <p className="mt-6 mb-10 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
              Your company profile has been successfully set up.
            </p>
            <a href="/dashboard">
              <Button variant="outline">Go to dashboard</Button>
            </a>
          </div>
          <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
            &copy; {new Date().getFullYear()} - Intervuave
          </p>
        </>
      )}
      <Modal
        isOpen={
          isNewCoreValueModalOpen ||
          isEditCoreValueModalOpen ||
          isViewCoreValueModalOpen
        }
        onClose={closeModal}
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
                    } else {
                      addCoreValue(coreValue);
                    }
                    closeModal();
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
      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - Intervuave
      </p>
    </div>
  );
};

export default OnBoarding;
