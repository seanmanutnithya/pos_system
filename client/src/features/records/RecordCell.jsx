import { cn } from "@/lib/cn";

// The first letter of the name stands in for a product photo
const initialOf = (name) => (Array.from(name.trim())[0] ?? "?").toUpperCase();

// Main cell of a row: a letter tile, the name, and a second line of detail
const RecordCell = ({ title, subtitle, muted = false }) => (
  <div className="flex max-w-xs items-center gap-3">
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-lg text-sm font-bold",
        muted ? "bg-paper text-muted" : "bg-brand-soft text-brand-strong",
      )}
    >
      {initialOf(title)}
    </span>
    <div className="min-w-0">
      <p className="truncate font-medium">{title}</p>
      {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
    </div>
  </div>
);

export default RecordCell;
