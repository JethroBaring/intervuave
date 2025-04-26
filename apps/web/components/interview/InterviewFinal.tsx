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
import { Camera, Check, Loader, Mic } from "lucide-react";

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
    role,
    isSpeaking,
    company,
    isSubmitting,
    currentStep,
    setCurrentStep,
    nextDisable,
    forceStopCamera,
  } = useInterviewerStore();
  // const [currentStep, setCurrentStep] = useState(0);
  const [consent, setConsent] = useState({
    videoAndAudio: false,
    aiAnalysis: false,
    personalInfo: false,
    privacyTerms: false,
  });
  const [countdown, setCountdown] = useState(5);

  const handleInterviewToggle = useCallback(async () => {
    if (isRecording) {
      stopInterview();
    } else {
      await startInterview();
    }
  }, [isRecording, startInterview, stopInterview]);
  const [hideFinish, setHideFinish] = useState(false);

  const handleNextQuestion = useCallback(() => {
    endCurrentQuestion();
    if (currentQuestionIndex >= questions.length - 1) {
      // ✅ correct comparison
      setHideFinish(true);
      stopInterview();
    } else {
      console.log("hello");
      useInterviewerStore.setState({
        currentQuestionIndex: currentQuestionIndex + 1,
      });
      nextQuestion();
    }
  }, [nextQuestion, currentQuestionIndex, questions.length]);

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

  useEffect(() => {
    return () => {
      console.log("Interview component unmounting, stopping camera and mic");
      useInterviewerStore.getState().forceStopCamera();
    };
  }, []);

  // 🆕 Add this!
  useEffect(() => {
    if (currentStep === 5) {
      forceStopCamera();
    }
  }, [currentStep, forceStopCamera]);

  const streamRef = getStreamRef();

  useEffect(() => {
    if (currentStep === 4 && videoRef.current && streamRef) {
      videoRef.current.srcObject = streamRef;
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 4 && countdown === 0) {
      handleInterviewToggle();
    }
  }, [currentStep, countdown]);

  useEffect(() => {
    let timer: any;
    if (currentStep === 4) {
      timer = setInterval(() => {
        console.log("test");
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [currentStep]);

  useEffect(() => {
    return () => {
      console.log("Interview component unmounting, stopping camera and mic");
      stopInterview();
    };
  }, [stopInterview]);

  if (!isValid || isExpired) {
    return <ExpiredInvalidInterview isInvalid={isValid} />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 overflow-hidden z-1">
        <GridShape />
        {currentStep === 0 && (
          <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
            <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
              Welcome to your Interview
            </h1>
            <p className="mt-6 mb-10 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
              You're applying for the position of {role} at {company.name}
            </p>
            <Button onClick={() => setCurrentStep(1)}>
              Begin Interview Setup
            </Button>
          </div>
        )}

        {currentStep === 1 && (
          <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px] md:py-0 md:max-w-[700px] max-h-screen sm:max-h-none">
            <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
              Privacy and Consent
            </h1>
            <div className="mt-6 mb-10 flex flex-col gap-3 text-gray-700 dark:text-gray-400 text-sm sm:text-lg w-fit mx-auto">
              <div className="flex items-start sm:items-center gap-3">
                <Checkbox
                  checked={consent.videoAndAudio}
                  onChange={() =>
                    setConsent((prev) => ({
                      ...prev,
                      videoAndAudio: !prev.videoAndAudio,
                    }))
                  }
                />
                <span className="block text-base sm:text-lg font-medium text-gray-700 dark:text-gray-400 text-left">
                  I consent to video and audio recording of the interview
                </span>
              </div>
              <div className="flex items-start sm:items-center gap-3">
                <Checkbox
                  checked={consent.aiAnalysis}
                  onChange={() =>
                    setConsent((prev) => ({
                      ...prev,
                      aiAnalysis: !prev.aiAnalysis,
                    }))
                  }
                />
                <span className="block text-base sm:text-lg font-medium text-gray-700 dark:text-gray-400 text-left">
                  I understand my interview will be analyzed by AI
                </span>
              </div>
              <div className="flex items-start sm:items-center gap-3">
                <Checkbox
                  checked={consent.personalInfo}
                  onChange={() =>
                    setConsent((prev) => ({
                      ...prev,
                      personalInfo: !prev.personalInfo,
                    }))
                  }
                />
                <span className="block text-base sm:text-lg font-medium text-gray-700 dark:text-gray-400 text-left">
                  I consent to processing of my personal information
                </span>
              </div>
              <div className="flex items-start sm:items-center gap-3">
                <Checkbox
                  checked={consent.privacyTerms}
                  onChange={() =>
                    setConsent((prev) => ({
                      ...prev,
                      privacyTerms: !prev.privacyTerms,
                    }))
                  }
                />
                <span className="block text-base sm:text-lg font-medium text-gray-700 dark:text-gray-400 text-left">
                  I have read and agree to the privacy terms
                </span>
              </div>
            </div>
            <Button
              onClick={() => setCurrentStep(3)}
              disabled={
                !consent.videoAndAudio ||
                !consent.privacyTerms ||
                !consent.personalInfo ||
                !consent.aiAnalysis
              }
            >
              Continue to Camera Preview
            </Button>
          </div>
        )}

        {(currentStep === 3 || currentStep === 4) && (
          <div
            className={`${
              currentStep === 3
                ? "mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]"
                : "h-full w-full max-h-[700px] max-w-[1200px] flex gap-5 md:h-[700px] md:w-[1200px]"
            }`}
          >
            {currentStep === 3 && (
              <>
                <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
                  Camera Preview
                </h1>
                <Card className="mt-6 mb-10 flex flex-col gap-3 text-gray-700 dark:text-gray-400 sm:text-lg w-full h-[300px] sm:h-[400px]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
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
                <div className="absolute left-2 sm:left-5 top-2 sm:top-5 text-xs sm:text-base">
                  {candidate?.firstName} {candidate?.lastName} (You)
                </div>

                {isRecording && (
                  <div className="absolute top-8 sm:top-12 left-2 sm:left-5 flex items-center gap-2">
                    <span className="animate-pulse w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full"></span>
                    <p className="text-red-500 font-medium text-xs sm:text-base">Recording</p>
                  </div>
                )}

                <div className="absolute top-2 sm:top-5 right-2 sm:right-5">
                  <div className="flex-1 p-2 sm:p-3 relative h-[60px] w-[60px] sm:h-[100px] sm:w-[100px] flex items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-800">
                    <Image
                      src="/images/interview-bot.png"
                      width={50}
                      height={50}
                      alt="interview_bot"
                      className="object-cover rounded-full sm:w-[80px] sm:h-[80px]"
                    />
                    {isSpeaking && <span className="animate-speak" />}
                  </div>
                </div>

                {/* Shared video */}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover rounded-2xl"
                />

                {countdown > 0 && (
                  <div className="h-full w-full flex items-center justify-center absolute text-[60px] sm:text-[100px]">
                    {countdown}
                  </div>
                )}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-999 w-[90%]">
                  {isRecording &&
                    questions[currentQuestionIndex] &&
                    !nextDisable && (
                      <div className="text-center text-sm sm:text-xl font-medium text-gray-700 dark:text-white">
                        ({currentQuestionIndex + 1}/{questions.length}). {questions[currentQuestionIndex].questionText}
                      </div>
                    )}
                  <div className="flex gap-3">
                    {!hideFinish && (
                      <Button
                        onClick={handleNextQuestion}
                        disabled={isSubmitting || countdown > 0 || nextDisable}
                      >
                        {isSubmitting && (
                          <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        )}
                        {currentQuestionIndex + 1 === questions.length
                          ? "Finish Interview"
                          : "Next"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {currentStep === 5 && (
          <>
            {isSubmitting ? (
              <Loader className="h-24 w-24 sm:h-40 sm:w-40 text-brand-400 animate-spin" />
            ) : (
              <Check className="text-brand-400 h-32 w-32 sm:h-48 sm:w-48" />
            )}
            <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
              <h1 className="mt-6 mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
                {isSubmitting
                  ? "Submitting interview..."
                  : "Interview completed!"}
              </h1>
              {!isSubmitting && (
                <>
                  <p className="mt-6 mb-10 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
                    Thank you for completing your interview. Your responses have
                    been recorded and will be analyzed by our AI assessment
                    system.
                  </p>
                  <a href="/dashboard">
                    <Button variant="outline">Home</Button>
                  </a>
                </>
              )}
            </div>
            <p className="absolute text-xs sm:text-sm text-center text-gray-500 -translate-x-1/2 bottom-3 sm:bottom-6 left-1/2 dark:text-gray-400">
              &copy; {new Date().getFullYear()} - Intervuave
            </p>
          </>
        )}

        <p className="absolute text-xs sm:text-sm text-center text-gray-500 -translate-x-1/2 bottom-3 sm:bottom-6 left-1/2 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - Intervuave
        </p>
      </div>
    </Suspense>
  );
}
