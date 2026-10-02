import Icon from "./Icon";

const Alert = ({ title, action, children }) => (
  <div
    role="alert"
    className="flex flex-wrap items-start gap-3 rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger"
  >
    <Icon name="alert" size={18} className="mt-px shrink-0" />
    <div className="min-w-0 flex-1">
      {title && <p className="font-medium">{title}</p>}
      {children && (
        <div className={title ? "mt-1 text-ink/80" : undefined}>{children}</div>
      )}
    </div>
    {action}
  </div>
);

export default Alert;
