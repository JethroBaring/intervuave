"use client";

import { useMemo } from "react";
import { Board } from "../ui/shared/board";
import { TBoard, TColumn } from "../ui/shared/data";
import { useCompanyStore } from "@/stores/useCompanyStore";

export default function Kanban() {
  const interviews = useCompanyStore((state) => state.interviews);

  const boardData: TBoard = useMemo(() => {
    const columns: TColumn[] = [
      { id: "draft", title: "Draft", cards: [], canAdd: true },
      { id: "pending", title: "Pending", cards: [] },
      { id: "submitted", title: "Submitted", cards: [] },
      { id: "processing", title: "Processing", cards: [] },
      { id: "evaluated", title: "Evaluated", cards: [] },
      { id: "expired", title: "Expired", cards: [] },
    ];

    interviews.forEach((interview) => {
      const column = columns.find(
        (col) => col.id === interview.status.toLowerCase().replace(" ", "_")
      );
      if (column) {
        column.cards.push({
          interview,
          candidate: interview.candidate,
        });
      }
    });

    return { columns };
  }, [interviews]);

  return <Board key={JSON.stringify(boardData)} initial={boardData} />;
}
