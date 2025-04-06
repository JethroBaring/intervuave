import Calendar from "@/components/ui/calendar/Calendar";
import Card from "@/components/ui/common/Card";
import CardWithActions from "@/components/ui/common/CardWithActions";
import ComponentCard from "@/components/ui/common/ComponentCard";
import PageBreadcrumb from "@/components/ui/common/PageBreadCrumb";
import Roles from "@/components/roles/Roles";
import { PuzzleIcon } from "lucide-react";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Calender | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Calender page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};
export default function page() {

  return (
    <div className="text-gray-500 dark:text-gray-400">
      <PageBreadcrumb pageTitle="Roles" />
      <Roles /> 
    </div>
  );
}
