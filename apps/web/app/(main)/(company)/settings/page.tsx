import CompanyProfile from "@/components/profile/CompanyProfile";
import PageBreadcrumb from "@/components/ui/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Settings | Intervuave",
};

export default function Profile() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Settings" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <CompanyProfile />
      </div>
    </div>
  );
}
