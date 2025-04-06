import GridShape from "@/components/ui/common/GridShape";
import { CircleAlert, TimerOff } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ExpiredInvalidInterview({
  isInvalid,
}: {
  isInvalid: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <div className="flex items-center justify-center mb-8">
          {isInvalid ? (
            <CircleAlert className="h-44 w-44 text-brand-300" />
          ) : (
            <TimerOff className="h-44 w-44 text-brand-300" />
          )}
        </div>
        <h1 className="mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
          {isInvalid ? "INVALID" : "EXPIRED"}
        </h1>
        <p className="mt-5 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          {isInvalid
            ? "The interview link you used is invalid or has been tampered with. Please check the link or contact your recruiter for assistance."
            : "This interview link has expired and is no longer valid. Please contact your recruiter to request a new invitation."}
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Back to Home Page
        </Link>
      </div>
      {/* <!-- Footer --> */}
      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - Intervuave
      </p>
    </div>
  );
}
