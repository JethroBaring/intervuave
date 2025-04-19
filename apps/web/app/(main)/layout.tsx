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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100/50 dark:from-brand-900/20 dark:via-gray-900 dark:to-brand-800/20">
        <div className="max-w-md w-full space-y-8 p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-sm text-gray-600">
              You need to be logged in to access this page.
            </p>
          </div>
          <div className="mt-8">
            <a
              href="/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </a>
          </div>
        </div>
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
