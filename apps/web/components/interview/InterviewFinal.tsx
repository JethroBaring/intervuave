"use client";
import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import Card from "@/components/ui/common/Card";
import Button from "@/components/ui/button/Button";
import Image from "next/image";
import GridShape from "@/components/ui/common/GridShape";
import { useSearchParams } from "next/navigation";
import ExpiredInvalidInterview from "@/components/interview/InvalidExpiredInterview";
import { useInterviewerStore } from "@/stores/useInterviewerStore";
import Checkbox from "../ui/form/input/Checkbox";
import { Camera, Check, Mic } from "lucide-react";

export default function Interview() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const {
    questions,
    currentQuestionIndex,
    isRecording,
    startInterview,
    nextQuestion,
    stopInterview,
    setVideoRef,
    toggleCamera,
    endCurrentQuestion,
    verifyToken,
    isValid,
    isExpired,
    isCameraOn,
    getStreamRef,
    candidate,
  } = useInterviewerStore();
  const [currentStep, setCurrentStep] = useState(0);

  const handleInterviewToggle = useCallback(async () => {
    if (isRecording) {
      stopInterview();
    } else {
      await startInterview();
    }
  }, [isRecording, startInterview, stopInterview]);

  const handleNextQuestion = useCallback(() => {
    endCurrentQuestion();
    if (currentQuestionIndex >= questions.length) {
      stopInterview();
    } else {
      nextQuestion();
    }
  }, [nextQuestion]);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token, verifyToken]);

  useEffect(() => {
    if ((currentStep === 3 || currentStep === 4) && !isCameraOn) {
      toggleCamera();
    }
  }, [currentStep, toggleCamera, isCameraOn]);

  useEffect(() => {
    setVideoRef(videoRef);
  }, [setVideoRef]);

  const streamRef = getStreamRef();

  useEffect(() => {
    if (currentStep === 4 && videoRef.current && streamRef) {
      videoRef.current.srcObject = streamRef;
      handleInterviewToggle();
    }
  }, [currentStep]);

  if (!isValid || isExpired) {
    return <ExpiredInvalidInterview isInvalid={isValid} />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <GridShape />
        {currentStep === 0 && (
          <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
            <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
              Welcome to your Interview
            </h1>
            <p className="mt-6 mb-10 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
              You're applying for the position of Software Engineer at
              TechInnovate
            </p>
            <Button onClick={() => setCurrentStep(1)}>
              Begin Interview Setup
            </Button>
          </div>
        )}

        {currentStep === 1 && (
          <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
            <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
              Privacy and Consent
            </h1>
            <div className="mt-6 mb-10 flex flex-col gap-3 text-gray-700 dark:text-gray-400 sm:text-lg w-fit mx-auto">
              <div className="flex items-center gap-3">
                <Checkbox checked={true} onChange={() => {}} />
                <span className="block text-lg font-medium text-gray-700 dark:text-gray-400">
                  I consent to video and audio recording of the interview
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={true} onChange={() => {}} />
                <span className="block text-lg font-medium text-gray-700 dark:text-gray-400">
                  I understand my interview will be analyzed by AI
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={true} onChange={() => {}} />
                <span className="block text-lg font-medium text-gray-700 dark:text-gray-400">
                  I consent to processing of my personal information
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={true} onChange={() => {}} />
                <span className="block text-lg font-medium text-gray-700 dark:text-gray-400">
                  I have read and agree to the privacy terms
                </span>
              </div>
            </div>
            <Button onClick={() => setCurrentStep(2)}>
              Continue to System Check
            </Button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
            <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
              System Compatibility
            </h1>
            <div className="mt-6 mb-10 flex flex-col gap-3 text-gray-700 dark:text-gray-400 sm:text-lg mx-auto max-w-[250px]">
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <Camera className="text-brand-400" />
                  <span className="block text-lg font-medium text-gray-700 dark:text-gray-400">
                    Camera
                  </span>
                </div>
                <Check className="text-green-500" />
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <Mic className="text-brand-400" />
                  <span className="block text-lg font-medium text-gray-700 dark:text-gray-400">
                    Microphone
                  </span>
                </div>
                <Check className="text-green-500" />
              </div>
            </div>
            <Button onClick={() => setCurrentStep(3)}>
              Preview Your Camera
            </Button>
          </div>
        )}
        {(currentStep === 3 || currentStep === 4) && (
          <div
            className={`${
              currentStep === 3
                ? "mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]"
                : "h-[700px] w-[1200px] flex gap-5"
            }`}
          >
            {currentStep === 3 && (
              <>
                <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
                  Camera Preview
                </h1>
                <Card className="mt-6 mb-10 flex flex-col gap-3 text-gray-700 dark:text-gray-400 sm:text-lg w-full h-[400px]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover rounded-2xl"
                  />
                </Card>
                <Button
                  onClick={() => setCurrentStep(4)}
                  disabled={!isCameraOn}
                >
                  Start Interview
                </Button>
              </>
            )}

            {currentStep === 4 && (
              <Card className="flex-auto h-full flex flex-col gap-5 text-gray-500 dark:text-gray-400 relative">
                <div className="absolute left-5 top-5">
                  {candidate?.firstName} {candidate?.lastName} (You)
                </div>

                {isRecording && (
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></span>
                    <p className="text-red-500 font-medium">Recording</p>
                  </div>
                )}

                <div className="absolute top-5 right-5">
                  <div className="flex-1 p-3 relative h-[100px] w-[100px] flex items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-800">
                    <Image
                      src="/images/interview-bot.png"
                      width={80}
                      height={80}
                      alt="interview_bot"
                      className="object-cover rounded-full"
                    />
                  </div>
                </div>

                {/* Shared video */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover rounded-2xl"
                />

                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-999">
                  {isRecording && questions[currentQuestionIndex - 1] && (
                    <div className="text-center text-xl font-medium text-gray-700 dark:text-white">
                      {questions[currentQuestionIndex - 1].questionText}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button onClick={handleInterviewToggle}>
                      {isRecording ? "Stop Interview" : "Start Interview"}
                    </Button>
                    {isRecording && (
                      <Button onClick={handleNextQuestion}>Next</Button>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - Intervuave
        </p>
      </div>
    </Suspense>
  );
}
