import Checkbox from "./Checkbox";
import Icon from "./Icon";
import { cn } from "@/lib/cn";

const cardClasses = "rounded-2xl border border-line bg-white";
const ARIA_SORT = { asc: "ascending", desc: "descending" };
const SORT_ICONS = { asc: "chevron-up", desc: "chevron-down" };

// columns: [{ key, header, render?(row), sortValue?(row), className?, headerClassName? }]
// Without render, a cell shows row[key].
//
// Sorting: pass `sort` ({ key, direction: "asc" | "desc" } or null) and
// `onSortChange`. Columns with a sortValue get a sort button in the header.
// Selection: pass `selectedKeys` (a Set of row keys) and `onSelectionChange`;
// a checkbox column is added. `className` replaces the table's minimum width.
const DataTable = ({
  caption,
  columns,
  rows,
  getRowKey,
  getRowLabel,
  loading = false,
  emptyState,
  skeletonRows = 5,
  sort,
  onSortChange,
  selectedKeys,
  onSelectionChange,
  className,
}) => {
  // Shown outside the table so it stays centred on narrow screens
  if (!loading && rows.length === 0) {
    return <div className={cardClasses}>{emptyState}</div>;
  }

  const selectable = Boolean(onSelectionChange);
  const rowKeys = rows.map(getRowKey);
  const selectedCount = selectable ? rowKeys.filter((key) => selectedKeys.has(key)).length : 0;
  const allSelected = rowKeys.length > 0 && selectedCount === rowKeys.length;

  // Selects or clears this page's rows, keeping rows selected on other pages
  const toggleAll = () => {
    const next = new Set(selectedKeys);
    rowKeys.forEach((key) => (allSelected ? next.delete(key) : next.add(key)));
    onSelectionChange(next);
  };

  const toggleRow = (key) => {
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  const toggleSort = (key) =>
    onSortChange(
      sort?.key === key && sort.direction === "asc"
        ? { key, direction: "desc" }
        : { key, direction: "asc" },
    );

  return (
    <div className={cn(cardClasses, "overflow-x-auto")}>
      <table
        aria-busy={loading || undefined}
        className={cn("w-full border-collapse text-left text-sm", className ?? "min-w-160")}
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-paper/70">
          <tr className="border-b border-line">
            {selectable && (
              <th scope="col" className="w-12 px-4 py-3">
                <Checkbox
                  aria-label="Select all rows on this page"
                  checked={allSelected}
                  indeterminate={selectedCount > 0 && !allSelected}
                  onChange={toggleAll}
                  disabled={loading}
                />
              </th>
            )}
            {columns.map((column) => {
              const direction = sort?.key === column.key ? sort.direction : null;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={direction ? ARIA_SORT[direction] : undefined}
                  className={cn(
                    "px-4 py-3 font-medium whitespace-nowrap text-ink/70",
                    column.headerClassName,
                  )}
                >
                  {column.sortValue && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      {column.header}
                      <Icon
                        name={direction ? SORT_ICONS[direction] : "chevrons-up-down"}
                        size={14}
                        className={direction ? "text-brand" : "text-muted/70"}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {loading
            ? Array.from({ length: skeletonRows }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {selectable && <td className="px-4 py-4" />}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-4">
                      <div className="h-3.5 w-3/4 max-w-40 animate-pulse rounded-full bg-ink/5" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => {
                const key = getRowKey(row);
                const selected = selectable && selectedKeys.has(key);
                return (
                  <tr
                    key={key}
                    className={cn(
                      "transition-colors",
                      selected ? "bg-brand-soft/50" : "hover:bg-paper/60",
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <Checkbox
                          aria-label={`Select ${getRowLabel(row)}`}
                          checked={selected}
                          onChange={() => toggleRow(key)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className={cn("px-4 py-3", column.className)}>
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
