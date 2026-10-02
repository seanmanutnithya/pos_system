import { cn } from "@/lib/cn";

const TONES = {
  brand: "bg-brand-soft text-brand-strong",
  neutral: "bg-paper text-muted ring-1 ring-line ring-inset",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

const Badge = ({ tone = "neutral", children }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
      TONES[tone],
    )}
  >
    <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
    {children}
  </span>
);

export default Badge;
