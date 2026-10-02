import { cn } from "@/lib/cn";

// On/off toggle. The label is part of the button, so all of it is clickable.
const Switch = ({ label, checked, onChange, className }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      "inline-flex items-center gap-3 rounded-full text-sm font-medium whitespace-nowrap",
      "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand",
      className,
    )}
  >
    {label}
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-brand" : "bg-ink/20",
      )}
    >
      <span
        className={cn(
          "size-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5.5" : "translate-x-0.5",
        )}
      />
    </span>
  </button>
);

export default Switch;
