import Icon from "./Icon";
import { cn } from "@/lib/cn";

// Icon tile colors, all from the brand palette
const TILE_TONES = {
  brand: "bg-brand text-white",
  soft: "bg-brand-soft text-brand-strong",
  ink: "bg-ink text-white",
  neutral: "bg-paper text-ink ring-1 ring-line ring-inset",
};

// One number with a label, e.g. "Total Products 250".
// badge: { text, trend?: "up" } shown next to the hint.
const StatCard = ({ label, value, icon, tone = "soft", hint, badge, loading = false }) => (
  <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4">
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          TILE_TONES[tone],
        )}
      >
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted">{label}</p>
        {loading ? (
          <div className="mt-1.5 h-6 w-16 animate-pulse rounded-md bg-ink/5" />
        ) : (
          <p className="truncate text-2xl leading-tight font-bold tracking-tight tabular-nums">
            {value}
          </p>
        )}
      </div>
    </div>
    <div className="flex min-h-5 items-center justify-between gap-2 text-xs">
      <span className="truncate text-muted">{loading ? "" : hint}</span>
      {badge && !loading && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 font-medium text-brand-strong">
          {badge.trend === "up" && <Icon name="arrow-up" size={12} strokeWidth={2.25} />}
          {badge.text}
        </span>
      )}
    </div>
  </div>
);

export default StatCard;
