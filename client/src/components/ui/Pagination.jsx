import Icon from "./Icon";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

// Page numbers to show: the first, the last, and the current page with its
// neighbours. A gap of one page shows that page; a longer gap becomes "…".
const getPageItems = (page, pageCount) => {
  const pages = [...new Set([1, page - 1, page, page + 1, pageCount])]
    .filter((number) => number >= 1 && number <= pageCount)
    .sort((a, b) => a - b);

  const items = [];
  pages.forEach((number, index) => {
    const gap = number - (pages[index - 1] ?? number);
    if (gap === 2) items.push(number - 1);
    else if (gap > 2) items.push(`gap-${number}`);
    items.push(number);
  });
  return items;
};

const buttonClasses = cn(
  "grid size-8 place-items-center rounded-lg border text-sm font-medium tabular-nums transition-colors",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
  "disabled:pointer-events-none disabled:opacity-40",
);
const idleClasses = "border-line bg-white hover:border-ink/30";

const Pagination = ({ page, pageSize, total, onPageChange }) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
      <p className="text-muted">
        Showing {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(buttonClasses, idleClasses)}
        >
          <Icon name="chevron-left" size={16} />
        </button>
        {getPageItems(page, pageCount).map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                buttonClasses,
                item === page ? "border-brand bg-brand text-white" : idleClasses,
              )}
            >
              {item}
            </button>
          ) : (
            <span
              key={item}
              aria-hidden="true"
              className="grid size-8 place-items-center text-muted"
            >
              …
            </span>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className={cn(buttonClasses, idleClasses)}
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
