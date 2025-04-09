"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth(); // Check authentication on page load
  }, [checkAuth]);

  if (!isAuthenticated) {
    return (
      <div>
        <p>You are not logged in.</p>
        <a href="/signin">Go to login</a>
      </div>
    );
  }

  const isOnboardingPage = pathname.startsWith("/onboarding");

  if (isOnboardingPage) {
    // No sidebar, no header → pure onboarding page
    return <>{children}</>;
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <div className="h-[76px]">
          <AppHeader />
        </div>
        {/* Page Content */}
        <div className="flex-1 overflow-hidden p-4 md:p-6 ">{children}</div>
      </div>
    </div>
  );
}
