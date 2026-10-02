import Icon from "./Icon";
import { cn } from "@/lib/cn";

// `shortcut` shows a key hint (e.g. "Ctrl K") while the box is empty.
// Other props, such as aria-keyshortcuts, go on the <input>.
const SearchInput = ({ ref, value, onChange, label, placeholder, shortcut, className, ...props }) => (
  <div className={cn("relative", className)}>
    <Icon
      name="search"
      size={16}
      className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
    />
    <input
      ref={ref}
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      placeholder={placeholder}
      className={cn(
        "h-10 w-full rounded-full border border-line bg-white pl-10 text-sm transition-colors",
        shortcut ? "pr-16" : "pr-10",
        "placeholder:text-muted/80 [&::-webkit-search-cancel-button]:appearance-none",
        "focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-hidden",
      )}
      {...props}
    />
    {value ? (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-muted transition-colors hover:bg-paper hover:text-ink"
      >
        <Icon name="x" size={14} />
      </button>
    ) : (
      shortcut && (
        <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-line bg-paper px-1.5 py-0.5 font-sans text-xs text-muted">
          {shortcut}
        </kbd>
      )
    )}
  </div>
);

export default SearchInput;
