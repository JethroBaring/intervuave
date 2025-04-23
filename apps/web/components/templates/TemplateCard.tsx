import moment from "moment";
import Badge from "../ui/badge/Badge";
import CardWithActions from "../ui/common/CardWithActions";

interface TemplateCardProps {
  template: any;
  onClick: any;
  onEdit: any;
  onDelete: any;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <CardWithActions
      title={template.name}
      key={template.id}
      onClick={onClick}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <div className="flex flex-col mt-1 gap-2">
        <h4 className="text-sm">Questions: {template.questions.length}</h4>
        <div className="flex items-center justify-between">
          <h4 className="text-sm">
            Linked interviews: {template?.interviews?.length || 0}
          </h4>
          {template?.interviews?.filter((interview: any) =>
            ["PENDING", "SUBMITTED", "PROCESSING", "EVALUATED"].includes(interview.status)
          ).length > 0 && <Badge>In use</Badge>}
        </div>
        <h4 className="text-sm">
          Last modified:{" "}
          {moment(template?.createdAt).format("MMMM D, YYYY - h:mm A")}
        </h4>
      </div>
    </CardWithActions>
  );
};

export default TemplateCard;
