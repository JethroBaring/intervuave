"use client";

import Card from "@/components/ui/common/Card";
import GridShape from "@/components/ui/common/GridShape";
import Checkbox from "@/components/ui/form/input/Checkbox";
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
          Camera Preview
        </h1>
        <Card className="h-[300px] w-[600px]">
          ''
        </Card>
        <Button>Start Video Interview</Button>
      </Card>
      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - Intervuave
      </p>
    </div>
  );
}
