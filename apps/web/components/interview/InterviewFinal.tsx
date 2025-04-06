"use client";
import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import Card from "@/components/ui/common/Card";
import Button from "@/components/ui/button/Button";
import Image from "next/image";
import GridShape from "@/components/ui/common/GridShape";
import { useInterviewFinalStore } from "@/stores-test/useInterviewFinal";
import { useSearchParams } from "next/navigation";
import ExpiredInvalidInterview from "@/components/interview/InvalidExpiredInterview";

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
  } = useInterviewFinalStore();

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
    toggleCamera();
  }, [toggleCamera]);

  useEffect(() => {
    setVideoRef(videoRef);
  }, [setVideoRef]);

  if (!isValid || isExpired) {
    return <ExpiredInvalidInterview isInvalid={isValid} />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <GridShape />
        <div className="h-[700px] w-[1200px] flex gap-5">
          <Card className="flex-auto h-full flex flex-col gap-5 text-gray-500 dark:text-gray-400 relative">
            <div className="absolute left-5 top-5">Candidate (You)</div>

            {isRecording && (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></span>
                <p className="text-red-500 font-medium">Recording</p>
              </div>
            )}

            <div className="absolute top-5 right-5">
              <Card className="flex-1 p-3 relative h-[100px] w-[100px] flex items-center justify-center">
                <Image
                  src="/images/interview-bot.png"
                  width={80}
                  height={80}
                  alt="interview_bot"
                  className="object-cover rounded-full"
                />
              </Card>
            </div>

            {/* <div
            className={`aspect-4/3 overflow-hidden rounded-lg ${
              !isRecording && "hidden"
            }`}
          > */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover rounded-2xl"
            />
            {/* </div> */}

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-999">
              {isRecording && questions[currentQuestionIndex] && (
                <div className="text-center text-xl font-medium text-gray-700 dark:text-white">
                  {questions[currentQuestionIndex].questionText}
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
        </div>
        <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - Intervuave
        </p>
      </div>
    </Suspense>
  );
}
