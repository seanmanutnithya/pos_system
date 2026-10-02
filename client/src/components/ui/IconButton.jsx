import Icon from "./Icon";
import { cn } from "@/lib/cn";

const TONES = {
  default: "text-ink hover:bg-paper",
  danger: "text-ink hover:bg-danger-soft hover:text-danger",
};

// Icon-only button. `label` is required: it is the accessible name and tooltip.
const IconButton = ({
  icon,
  label,
  tone = "default",
  size = "md",
  busy = false,
  className,
  ...props
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cn(
      "inline-flex shrink-0 items-center justify-center rounded-lg transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
      "disabled:pointer-events-none disabled:opacity-40",
      size === "sm" ? "size-8" : "size-10",
      TONES[tone],
      className,
    )}
    {...props}
  >
    <Icon
      name={icon}
      size={size === "sm" ? 16 : 18}
      className={busy ? "animate-spin" : undefined}
    />
  </button>
);

export default IconButton;
