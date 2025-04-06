'use client'

import Interview from "@/components/interview/InterviewFinal";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <Interview />
    </Suspense>
  );
}
