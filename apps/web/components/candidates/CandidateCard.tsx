import CardWithActions from "../ui/common/CardWithActions";
import { User } from "lucide-react";

interface CandidateCardProps {
  candidate: any;
  onClick: any;
  onEdit: any;
  onDelete: any;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onClick, onEdit, onDelete }) => {
  return (
    <CardWithActions 
      title={`${candidate.firstName} ${candidate.lastName}`} 
      key={candidate.id} 
      onClick={onClick} 
      onEdit={onEdit} 
      onDelete={onDelete}
    >
      <div className="flex flex-col mt-1 gap-2">
        <div className="flex gap-2 items-center">
          <User className="h-4 w-4 text-blue-500" />
          <h4 className="text-sm">{candidate.email}</h4>
        </div>
        <h4 className="text-sm">Created: {new Date(candidate.createdAt).toLocaleDateString()}</h4>
        <h4 className="text-sm">Status: {candidate.deletedAt === null ? "Active" : "Inactive"}</h4>
      </div>
    </CardWithActions>
  );
};

export default CandidateCard; 