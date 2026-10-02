import { formatNumber } from "@/lib/format";

const DAY_MS = 24 * 60 * 60 * 1000;
const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

export const toTime = (value) => (value ? new Date(value).getTime() : 0);

// Case-insensitive "contains" over a record's searchable values
export const matchesSearch = (values, search) => {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return values.some((value) => value != null && String(value).toLowerCase().includes(query));
};

const compareValues = (a, b) =>
  typeof a === "number" && typeof b === "number"
    ? a - b
    : collator.compare(String(a ?? ""), String(b ?? ""));

// Sorts by the value `getValue` returns. Array.prototype.sort is stable, so
// records with equal values keep the API order (by id).
export const sortRecords = (records, getValue, direction) => {
  if (!getValue) return records;
  const sign = direction === "desc" ? -1 : 1;
  return [...records].sort((a, b) => sign * compareValues(getValue(a), getValue(b)));
};

// Filter chips for records with an `active` flag. The first chip shows all.
export const statusFilters = (allLabel) => [
  { value: "all", label: allLabel },
  { value: "active", label: "Active", match: (record) => record.active },
  { value: "inactive", label: "Inactive", match: (record) => !record.active },
];

const percentOf = (count, total) => (total ? Math.round((count / total) * 100) : 0);

const countCreatedThisMonth = (records, now = new Date()) =>
  records.filter((record) => {
    const created = new Date(record.created_date);
    return (
      created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
    );
  }).length;

// Stat card builders. A card is { label, value, icon, tone, hint, badge? }.

// The total, with how many were added this month
export const totalStat = (records, { label, icon }) => {
  const added = countCreatedThisMonth(records);
  return {
    label,
    icon,
    tone: "brand",
    value: formatNumber(records.length),
    hint: added > 0 ? "Added this month" : "None added this month",
    badge: added > 0 ? { text: `${formatNumber(added)} new`, trend: "up" } : undefined,
  };
};

// Active and inactive counts, each with its share of the total
export const statusStats = (records, noun) => {
  const active = records.filter((record) => record.active).length;
  const activePercent = percentOf(active, records.length);
  return [
    {
      label: "Active",
      icon: "check-circle",
      tone: "soft",
      value: formatNumber(active),
      hint: `Of all ${noun.plural}`,
      badge: { text: `${activePercent}%` },
    },
    {
      label: "Inactive",
      icon: "pause-circle",
      tone: "neutral",
      value: formatNumber(records.length - active),
      hint: `Of all ${noun.plural}`,
      badge: { text: `${records.length ? 100 - activePercent : 0}%` },
    },
  ];
};

// How many were added or changed in the last 7 days
export const recentlyUpdatedStat = (records) => {
  const since = Date.now() - 7 * DAY_MS;
  const count = records.filter((record) => toTime(record.updated_date) >= since).length;
  return {
    label: "Recently Updated",
    icon: "clock",
    tone: "ink",
    value: formatNumber(count),
    hint: "In the last 7 days",
  };
};
