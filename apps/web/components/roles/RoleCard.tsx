import React from "react";
import CardWithActions from "../ui/common/CardWithActions";
import { PuzzleIcon } from "lucide-react";

interface RoleCardProps {
  role: any;
  onClick: any;
  onEdit: any;
  onDelete: any;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <CardWithActions
      title={role.title}
      onClick={onClick}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <div className="flex flex-col mt-1 gap-2">
        <div className="flex gap-2 items-center">
          <PuzzleIcon className="h-4 w-4 text-blue-500" />
          <h4 className="text-sm">{role?.interviewTemplate?.name}</h4>
        </div>
        <h4 className="text-sm">Voice: Female</h4>
        <h4 className="text-sm">Candidates: 12</h4>
      </div>
    </CardWithActions>
  );
};

export default RoleCard;
