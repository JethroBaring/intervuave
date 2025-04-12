import OnBoarding from "@/components/onboarding/OnBoarding";
import CompanyProfile from "@/components/profile/CompanyProfile";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Onboarding | Intervuave",
};

export default function Profile() {
  return (
    <OnBoarding />
  );
}