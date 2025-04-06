import React from "react";
import Card from "../common/Card";
import { LockIcon } from "@/icons";

interface KanbanColumnProps {
  key: string;
  column: any;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ key, column }) => {
  return (
    <Card
      className="h-full min-w-[calc(25%-1.5rem*3/4)] p-3 flex flex-col gap-3"
      key={key}
    >
      <div className="flex items-center justify-between">
        <h2>{column.label}</h2>
        {column.systemLocked && <LockIcon />}
      </div>
      <div className="h-0 flex-auto overflow-scroll">
        <div className="flex flex-col gap-3">
          <Card className="min-h-[140px] p-3">Click me</Card>
          <Card className="min-h-[140px] p-3">Click me</Card>
          <Card className="min-h-[140px] p-3">Click me</Card>
          <Card className="min-h-[140px] p-3">Click me</Card>
          <Card className="min-h-[140px] p-3">Click me</Card>
          <Card className="min-h-[140px] p-3">Click me</Card>
          <Card className="min-h-[140px] p-3">Click me</Card>
          <Card className="min-h-[140px] p-3">Click me</Card>
        </div>
      </div>
    </Card>
  );
};

export default KanbanColumn;
