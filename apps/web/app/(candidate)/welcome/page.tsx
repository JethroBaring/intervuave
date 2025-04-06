"use client";

import Card from "@/components/common/Card";
import GridShape from "@/components/common/GridShape";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import { BadgeCheck, Camera, Check, CheckCircle, CircleCheck, Mic } from "lucide-react";
import React from "react";

export default function Error404() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />
      {/* <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
        <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
          Welcome to your Interview
        </h1>
        <p className="mt-6 mb-10 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          You're applying for the position of Software Engineer at TechInnovate
        </p>
        <Button>Begin Interview Setup</Button>
      </div> */}

      {/* <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
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
        <Button>Continue to System Check</Button>
      </div> */}

      {/* <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
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
        <Button>Continue to Interview</Button>
      </div> */}
      {/* <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
        <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
          Camera Preview
        </h1>
        <Card className="mt-6 mb-10 flex flex-col gap-3 text-gray-700 dark:text-gray-400 sm:text-lg w-full h-[400px]">
          {''}
        </Card>
        <Button>Start Interview</Button>
      </div> */}

      <Check className="text-brand-400 h-48 w-48" />
      <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[700px]">
        <h1 className="mt-6 mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-xl">
          Interview Submitted
        </h1>
        <p className="mt-6 mb-10 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
        Your interview has been received and is now being processed. We appreciate your participation.
        </p>
        <Button variant="outline">Back to home</Button>
      </div>
      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - Intervuave
      </p>
    </div>
  );
}
