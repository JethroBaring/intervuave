import Calendar from "@/components/ui/calendar/Calendar";
import PageBreadcrumb from "@/components/ui/common/PageBreadCrumb";
import KanbanTest from "@/components/kanban/Kanban";
import Kanban from "@/components/kanban/Kanban";
import { Board } from "@/components/ui/shared/board";
import { TBoard, TCard, TColumn } from "@/components/ui/shared/data";
import { usePagesDataStore } from "@/stores-test/pagesDataStore";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Interviews | Intervuave",
};

export default function page() {


  return (
    <div className="h-full flex flex-col text-gray-500 dark:text-gray-400 ">
      <PageBreadcrumb pageTitle="Interviews" />
      {/* <Kanban /> */}
      <Kanban />
    </div>
  );
}
