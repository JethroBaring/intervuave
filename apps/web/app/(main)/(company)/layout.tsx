"use client";

import { useCompanyStore } from "@/stores/useCompanyStore";
import { useAuthStore } from "@/useAuthStore";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface CompanyLayoutProps {
  children: React.ReactNode;
}

const CompanyLayout: React.FC<CompanyLayoutProps> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const { fetchAllCompanyData, isOnboarding } = useCompanyStore();

  const router = useRouter();

  useEffect(() => {
    if (user.id && user.companyId) {
      fetchAllCompanyData(user.companyId);
    }
  }, [user.id, user.companyId, fetchAllCompanyData]);

  useEffect(() => {
    if (isOnboarding) {
      router.push("/onboarding");
    }
  }, [isOnboarding]);

  return <>{children}</>;
};

export default CompanyLayout;
