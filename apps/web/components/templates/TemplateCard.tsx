import CardWithActions from "../ui/common/CardWithActions";

interface TemplateCardProps {
  template: any;
  onClick: any;
  onEdit: any;
  onDelete: any
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick, onEdit, onDelete }) => {
  return (
    <CardWithActions title={template.name} key={template.id} onClick={onClick} onEdit={onEdit} onDelete={onDelete}>
      <div className="flex flex-col mt-1 gap-2">
        <h4 className="text-sm">Metrics used: {template.metrics.every((metric: any) => metric.weight === 20) ? 'Default' : 'Custom'}</h4>
        <h4 className="text-sm">Questions: {template.questions.length}</h4>
        <h4 className="text-sm">Used in: {template?.roles?.length || 0} role/s</h4>
      </div>
    </CardWithActions>
  );
};

export default TemplateCard;
