import { useRef } from "react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { getNextIndex } from "@/lib/keyboard";

// Pick-one control styled like the guideline's Yes / No buttons, also used for
// filter chips. options: [{ value, label, count? }]; a count shows as "(12)".
// Pass aria-label or aria-labelledby; they go on the radiogroup.
const SegmentedControl = ({ options, value, onChange, size = "md", className, ...props }) => {
  const buttonsRef = useRef([]);
  const selectedIndex = options.findIndex((option) => option.value === value);

  const handleKeyDown = (event, index) => {
    const next = getNextIndex(event.key, index, options.length);
    if (next === null) return;
    event.preventDefault();
    onChange(options[next].value);
    buttonsRef.current[next]?.focus();
  };

  return (
    <div role="radiogroup" className={cn("flex flex-wrap gap-2", className)} {...props}>
      {options.map((option, index) => {
        const checked = index === selectedIndex;
        // Only the selected option is in the tab order; arrows move between them
        const focusable = checked || (selectedIndex === -1 && index === 0);
        return (
          <button
            key={String(option.value)}
            ref={(element) => {
              buttonsRef.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={focusable ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "inline-flex items-center justify-center gap-1 rounded-full border text-sm font-medium whitespace-nowrap transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              size === "sm" ? "h-8 px-3" : "h-10 px-4",
              checked
                ? "border-brand/50 bg-brand-soft text-brand-strong"
                : "border-line bg-white text-ink hover:border-ink/30",
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={cn("tabular-nums", !checked && "text-muted")}>
                ({formatNumber(option.count)})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
