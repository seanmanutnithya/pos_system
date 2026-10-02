import Icon from "./Icon";

const EmptyState = ({ icon = "box", title, description, action }) => (
  <div className="flex flex-col items-center px-6 py-16 text-center">
    <span className="grid size-12 place-items-center rounded-xl bg-brand-soft text-brand-strong">
      <Icon name={icon} size={22} />
    </span>
    <h3 className="mt-4 text-base font-bold">{title}</h3>
    {description && (
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
