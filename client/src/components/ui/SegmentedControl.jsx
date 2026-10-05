import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { getNextIndex } from "@/lib/keyboard";

// Pick-one control styled like the guideline's Yes / No buttons, also used for
// filter chips. options: [{ value, label, count? }]; a count shows as "(12)".
// The violet highlight slides from the old choice to the new one.
// Pass aria-label or aria-labelledby; they go on the radiogroup.
const SegmentedControl = ({
  options,
  value,
  onChange,
  size = "md",
  className,
  ...props
}) => {
  const selectedIndex = options.findIndex((option) => option.value === value);
  const { listRef, itemsRef, indicatorRef } = useSlidingIndicator(selectedIndex);

  const handleKeyDown = (event, index) => {
    const next = getNextIndex(event.key, index, options.length);
    if (next === null) return;
    event.preventDefault();
    onChange(options[next].value);
    itemsRef.current[next]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="radiogroup"
      className={cn("relative flex flex-wrap gap-2", className)}
      {...props}
    >
      {/* The selected look; it sits behind the chips and slides between them */}
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute top-0 left-0 rounded-full border border-brand/50 bg-brand-soft"
      />
      {options.map((option, index) => {
        const checked = index === selectedIndex;
        // Only the selected option is in the tab order; arrows move between them
        const focusable = checked || (selectedIndex === -1 && index === 0);
        return (
          <button
            key={String(option.value)}
            ref={(element) => {
              itemsRef.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={focusable ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "relative inline-flex items-center justify-center gap-1 rounded-full border text-sm font-medium whitespace-nowrap transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              size === "sm" ? "h-8 px-3" : "h-10 px-4",
              // The selected chip is see-through so the highlight behind it shows
              checked
                ? "border-transparent text-brand-strong"
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
