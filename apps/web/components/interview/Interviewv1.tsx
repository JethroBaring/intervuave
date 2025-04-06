"use client";
import { useEffect, useRef, useState } from "react";
import Card from "@/components/common/Card";
import Button from "@/components/ui/button/Button";
import Image from "next/image";
import { useInterviewStore } from "@/stores-test/interviewStore";
import { InfoIcon } from "@/icons";
import { useRoleForm } from "@/hooks-test/useRoleForm";
import { useInterviewer } from "@/hooks-test/useInterviewer";
import { useSearchParams } from "next/navigation";
import GridShape from "../common/GridShape";
import ExpiredInvalidInterview from "./InvalidExpiredInterview";

export default function Interview() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const transcriptsEndRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const verifyToken = useInterviewStore((s) => s.verifyToken);

  const { isValid, isExpired, questions } = useInterviewStore();

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token, verifyToken]);

  const {
    transcripts,
    isCameraOn,
    isRecording,
    toggleCamera,
    startInterview,
    setVideoRef,
    addTranscript,
    candidate,
  } = useInterviewStore();

  const {
    callStatus,
    isSpeaking,
    messages,
    lastMessage,
    handleCall,
    handleDisconnect,
  } = useInterviewer(questions);

  useEffect(() => {
    setVideoRef(videoRef);
  }, [setVideoRef]);

  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  useEffect(() => {
    if (lastMessage) {
      const sender = isSpeaking ? "bot" : "user";
      addTranscript(lastMessage, sender);
    }
  }, [lastMessage, isSpeaking, addTranscript]);

  if (!isValid || isExpired) {
    return <ExpiredInvalidInterview isInvalid={false} />;
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />
      <div className="h-[600px] w-[1300px] flex gap-5">
        <Card className="flex-auto h-full flex flex-col gap-5 text-gray-500 dark:text-gray-400 relative">
          <div className="left-5 top-5 absolute text-gray-500 dark:text-gray-400">
            {`${candidate?.firstName} ${candidate?.lastName}`} (You)
          </div>
          <div
            className={`absolute top-5 right-5 flex items-center gap-2 ${
              !isRecording && "hidden"
            }`}
          >
            <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></span>
            <p className="text-red-500 font-medium">Recording</p>
          </div>
          <div
            className={`aspect-4/3 overflow-hidden rounded-lg ${
              !isCameraOn && "hidden"
            }`}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover rounded-2xl"
            >
              <track kind="captions" srcLang="en" label="English captions" />
            </video>
          </div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-5 z-999">
            <Button onClick={toggleCamera}>
              {isCameraOn ? "Stop Camera" : "Start Camera"}
            </Button>
            <Button onClick={isRecording ? handleDisconnect : handleCall}>
              {isRecording ? "Stop Interview" : "Start Interview"}
            </Button>
          </div>
        </Card>

        <div className="w-[400px] flex flex-col gap-5">
          <Card className="flex-auto p-5 flex flex-col gap-5">
            <div className="text-gray-500 dark:text-gray-400 flex justify-between">
              <p>Transcripts</p>
              <div className="relative inline-block group">
                <InfoIcon />
                <div className="invisible absolute z-30 opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100 top-full mt-2.5 right-0 shadow rounded-2xl">
                  <div className="bg-white text-gray-700 dark:bg-[#1E2634] dark:text-white rounded-2xl  px-3 py-2 text-xs font-medium drop-shadow-4xl whitespace-normal min-w-[350px]">
                    Real-time transcripts are automatically cross-checked with
                    Whisper AI to ensure the most accurate version is used for
                    analysis.
                  </div>
                </div>
              </div>
            </div>
            <div className="h-0 flex-auto overflow-y-scroll scrollbar scrollbar-active:scrollbar-thumb-slate-700 scrollbar-active:scrollbar-track-slate-500">
              <div className="gap-4 flex flex-col ">
                {transcripts.map((item, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      item.sender === "bot" ? "items-start" : "items-end"
                    }`}
                  >
                    <p className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {item.sender === "bot" ? "Interviewer Bot" : "You"},{" "}
                      {new Date(item.time).toLocaleTimeString()}
                    </p>
                    <div
                      className={`px-3 py-2 rounded-lg w-fit max-w-[75%] text-sm ${
                        item.sender === "bot"
                          ? "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white/90 rounded-tl-sm"
                          : "bg-brand-500 text-white dark:bg-brand-500 rounded-tr-sm"
                      }`}
                    >
                      <p>{item.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={transcriptsEndRef} />
              </div>
            </div>
          </Card>

          <Card className="h-[220px] p-5 relative">
            <div className="absolute text-gray-500 dark:text-gray-400">
              Interviewer Bot
            </div>
            <div className="h-full w-full flex items-center justify-center">
              <div className="relative h-[130px] w-[130px] flex items-center justify-center">
                <Image
                  src="/images/interview-bot.png"
                  width={130}
                  height={130}
                  alt="interview_bot"
                  className="object-cover"
                />
                {isSpeaking && <span className="animate-speak" />}
              </div>
            </div>
          </Card>
        </div>
      </div>
      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - Intervuave
      </p>
    </div>
  );
}
