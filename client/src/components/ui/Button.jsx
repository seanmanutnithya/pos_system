import Icon from "./Icon";
import Spinner from "./Spinner";
import { cn } from "@/lib/cn";

// Variants follow the "UI Components" section of the brand guideline
const VARIANTS = {
  // Vibrant Violet: the main action on a screen
  primary: "bg-brand text-white hover:bg-brand-strong",
  // Deep Black: strong secondary action
  dark: "bg-ink text-white hover:bg-ink/85",
  // Black outline that fills black on hover
  outline: "border border-ink text-ink hover:bg-ink hover:text-white",
  // Light violet, used for selected or pressed actions
  soft: "bg-brand-soft text-brand-strong hover:bg-brand/25",
  // Quiet action, such as Cancel
  ghost: "border border-line bg-white text-ink hover:border-ink/40",
  danger: "bg-danger text-white hover:bg-danger/90",
};

// Heights sit on the 8px grid: 32px and 40px
const SIZES = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-4 text-sm",
};

const Button = ({
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled,
  type = "button",
  className,
  children,
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={cn(
      "inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
      "disabled:pointer-events-none disabled:opacity-50",
      VARIANTS[variant],
      SIZES[size],
      className,
    )}
    {...props}
  >
    {loading ? <Spinner /> : icon && <Icon name={icon} size={16} />}
    {children}
  </button>
);

export default Button;
