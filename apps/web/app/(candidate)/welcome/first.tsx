import Card from "@/components/common/Card";
import GridShape from "@/components/common/GridShape";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Error 404 | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Error 404 page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Error404() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />
      <Card className="w-[900px] p-10 flex flex-col items-center text-center gap-10">
        <h1 className="font-bold text-gray-800 dark:text-white/90 text-title-md">
          Welcome to your Interview
        </h1>
        <p className="text-base text-gray-700 dark:text-gray-400 sm:text-xl">
          You're applying for the position of Software Engineer at TechInnovate
        </p>
        <Button>Begin Interview Setup</Button>
      </Card>
      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - Intervuave
      </p>
    </div>
  );
}
