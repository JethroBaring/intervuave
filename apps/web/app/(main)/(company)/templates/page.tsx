import PageBreadcrumb from "@/components/ui/common/PageBreadCrumb";
import Templates from "@/components/templates/Templates";
import { useAuthStore } from "@/stores-test/authStore";
import { useTemplateStore } from "@/stores-test/templateStore";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates | Intervuave",
};
export default function Page() {

  return (
    <div className="text-gray-500 dark:text-gray-400">
      <PageBreadcrumb pageTitle="Templates" />
      <Templates />
    </div>
  );
}
