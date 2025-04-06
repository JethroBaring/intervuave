import PageBreadcrumb from "@/components/ui/common/PageBreadCrumb";
import Templates from "@/components/templates/Templates";
import { useAuthStore } from "@/stores-test/authStore";
import { useTemplateStore } from "@/stores-test/templateStore";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Calender | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Calender page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};
export default function Page() {

  return (
    <div className="text-gray-500 dark:text-gray-400">
      <PageBreadcrumb pageTitle="Templates" />
      <Templates />
    </div>
  );
}
