import GridShape from "@/components/ui/common/GridShape";
import ThemeTogglerTwo from "@/components/ui/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link href="/" className="block mb-4">
                  <div className="flex items-center justify-center gap-3">
                    <Image
                      className="rounded-lg"
                      src="/images/intervuave.png"
                      alt="Logo"
                      width={50}
                      height={50}
                    />
                    <p className="text-4xl font-medium text-white">
                      Intervuave
                    </p>
                  </div>
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                Interviews that Listen, Learn, and Evaluate
                </p>
              </div>
            </div>
          </div>
          {/* <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div> */}
        </div>
      </ThemeProvider>
    </div>
  );
}
