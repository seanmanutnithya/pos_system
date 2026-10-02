import { formatNumber } from "@/lib/format";

// Shown while table rows are selected. `children` are the bulk action buttons.
const SelectionBar = ({ count, onClear, children }) => (
  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand/30 bg-brand-soft px-4 py-2">
    <p className="text-sm font-medium text-brand-strong" aria-live="polite">
      {formatNumber(count)} selected
    </p>
    <div className="flex flex-wrap items-center gap-2">{children}</div>
    <button
      type="button"
      onClick={onClear}
      className="ml-auto rounded-md text-sm font-medium text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand"
    >
      Clear Selection
    </button>
  </div>
);

export default SelectionBar;
