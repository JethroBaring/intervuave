'use client'
import { Metadata } from "next";
import Interview from "@/components/interview/Interview";
import { Suspense } from "react";

// export const metadata: Metadata = {
//   title: "Sign-In | Intervuave",
//   description: "This is Next.js Signin Page TailAdmin Dashboard Template",
// };

export default function Page() {
  return <Suspense fallback={<div>Loading...</div>}>
    <Interview /> 
  </Suspense>;
}
