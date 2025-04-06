"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Card from "@/components/common/Card";
import Button from "@/components/ui/button/Button";
import Image from "next/image";
import { useElevenlabsInterviewerStore } from "@/stores-test/elevenlabsInterviewer";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export default function Interview() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const transcriptsEndRef = useRef<HTMLDivElement | null>(null);

  const {
    setVideoRef,
    toggleCamera,
    startInterview,
    stopInterview,
    transcripts,
    isCameraOn,
    isRecording,
    expectingUserInput,
    endCurrentQuestion,
  } = useElevenlabsInterviewerStore();

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    setVideoRef(videoRef);
  }, [setVideoRef]);

  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  // Auto-end question when user stops speaking
  useEffect(() => {
    if (!listening && transcript.trim() !== "" && expectingUserInput) {
      endCurrentQuestion(transcript.trim());
      resetTranscript();
    }
  }, [listening, transcript, expectingUserInput, endCurrentQuestion, resetTranscript]);

  const handleInterviewToggle = useCallback(async () => {
    if (isRecording) {
      stopInterview();
    } else {
      await startInterview();
    }
  }, [isRecording, startInterview, stopInterview]);

  const handleCameraToggle = useCallback(() => {
    toggleCamera();
  }, [toggleCamera]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <div className="h-[600px] w-[1300px] flex gap-5">
        <Card className="flex-auto h-full flex flex-col gap-5 text-gray-500 dark:text-gray-400 relative">
          <div className={`aspect-4/3 overflow-hidden rounded-lg ${!isCameraOn && "hidden"}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover rounded-2xl"
            />
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-5 z-999">
            <Button onClick={handleCameraToggle}>
              {isCameraOn ? "Stop Camera" : "Start Camera"}
            </Button>
            <Button onClick={handleInterviewToggle}>
              {isRecording ? "Stop Interview" : "Start Interview"}
            </Button>
          </div>
        </Card>

        <div className="w-[400px] flex flex-col gap-5">
          <Card className="flex-auto p-5 flex flex-col gap-5">
            <p className="text-gray-500 dark:text-gray-400">Transcripts</p>
            <div className="flex-auto overflow-y-scroll">
              {transcripts.map((item, index) => (
                <div key={index} className={`flex flex-col ${item.sender === "bot" ? "items-start" : "items-end"}`}>
                  <p className="text-xs">{item.sender}, {new Date(item.time).toLocaleTimeString()}</p>
                  <div className={`px-3 py-2 rounded-lg w-fit max-w-[75%] text-sm ${item.sender === "bot" ? "bg-gray-100 dark:bg-white/5" : "bg-brand-500 text-white"}`}>
                    <p>{item.message}</p>
                  </div>
                </div>
              ))}
              <div ref={transcriptsEndRef} />
            </div>
          </Card>

          <Card className="h-[220px] p-5 relative">
            <div className="absolute text-gray-500 dark:text-gray-400">Interviewer Bot</div>
            <div className="h-full w-full flex items-center justify-center">
              <div className="relative h-[130px] w-[130px] flex items-center justify-center">
                <Image src="/images/interview-bot.png" width={130} height={130} alt="interview_bot" />
                {expectingUserInput && <span className="animate-speak" />}
              </div>
            </div>
          </Card>
        </div>
      </div>
      <p className="absolute text-sm text-center text-gray-500 bottom-6 left-1/2 -translate-x-1/2">
        &copy; {new Date().getFullYear()} - Intervuave
      </p>
    </div>
  );
}
