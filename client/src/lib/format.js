const numberFormat = new Intl.NumberFormat();

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const weekdayDateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

// Prices use VITE_CURRENCY (an ISO code such as USD) when it is set,
// otherwise a plain number with 2 decimals
const createMoneyFormat = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  if (currency) {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency });
    } catch {
      console.warn(`VITE_CURRENCY "${currency}" isn't a valid currency code.`);
    }
  }
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const moneyFormat = createMoneyFormat();

export const formatNumber = (value) => numberFormat.format(value);

export const formatMoney = (value) => (value == null ? "—" : moneyFormat.format(value));

export const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : "—");

export const formatDateTime = (value) =>
  value ? dateTimeFormat.format(new Date(value)) : "—";

// e.g. "Wed, 1 Oct 2026" (the order follows the browser's language)
export const formatWeekdayDate = (date) => weekdayDateFormat.format(date);

// Local date as YYYY-MM-DD, for file names
export const formatFileDate = (date = new Date()) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join("-");

export const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// pluralize(1, "category", "categories") -> "1 category"
export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`;
