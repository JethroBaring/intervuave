"use client";

import Card from "@/components/common/Card";
import GridShape from "@/components/common/GridShape";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Error404() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />
      <Card className="w-[900px] p-10 flex flex-col items-center text-center gap-10">
        <h1 className="font-bold text-gray-800 dark:text-white/90 text-title-md">
          Privacy and Consent
        </h1>
        <div className="flex flex-col gap-3">
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
      </Card>
      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - Intervuave
      </p>
    </div>
  );
}
