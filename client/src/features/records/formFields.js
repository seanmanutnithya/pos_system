import { formatNumber } from "@/lib/format";

// Field types for RecordFormDialog. The form keeps what the user typed as text
// (and a boolean for status); these helpers convert to and from API values.
//
// A field is { name, label, type, required?, half?, hint?, placeholder? } plus:
//   text      maxLength?, suggestions?({ records }) -> ["Size", ...]
//   textarea  maxLength?
//   select    options({ lookups, record }) -> [{ value, label, group? }]
//   money     positive? (must be more than 0)
//   integer   0 or more
//   status    Active / Inactive
// `half: true` puts two fields side by side on wider screens.

// The largest values the database columns hold: DECIMAL(10,2) and INT
const MAX_MONEY = 99999999.99;
const MAX_INTEGER = 2147483647;
const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
const INTEGER_PATTERN = /^\d+$/;

const toFormValue = (field, value) => {
  if (field.type === "status") return value ?? true;
  if (value == null) return field.defaultValue ?? "";
  if (field.type === "money") return Number(value).toFixed(2);
  return String(value);
};

export const getInitialValues = (fields, record) =>
  Object.fromEntries(
    fields.map((field) => [field.name, toFormValue(field, record?.[field.name])]),
  );

const parseNumber = (field, text) => {
  if (text.startsWith("-")) return { error: `${field.label} can't be negative.` };

  if (field.type === "money") {
    if (!MONEY_PATTERN.test(text)) {
      return { error: `Enter ${field.label.toLowerCase()} as a number, like 2.50.` };
    }
    const amount = Number(text);
    if (field.positive && amount === 0) return { error: `${field.label} must be more than 0.` };
    if (amount > MAX_MONEY) {
      return { error: `${field.label} can't be more than ${formatNumber(MAX_MONEY)}.` };
    }
    return { value: amount };
  }

  if (!INTEGER_PATTERN.test(text)) {
    return { error: `${field.label} must be a whole number, like 25.` };
  }
  const number = Number(text);
  if (number > MAX_INTEGER) return { error: `${field.label} is too large.` };
  return { value: number };
};

const parseField = (field, rawValue) => {
  if (field.type === "status") return { value: rawValue };

  const text = rawValue.trim();
  if (text === "") {
    if (field.required) {
      return { error: field.requiredMessage ?? `${field.label} is required.` };
    }
    // An empty optional number counts as 0; empty optional text means "none"
    return { value: field.type === "money" || field.type === "integer" ? 0 : null };
  }

  if (field.type === "select") return { value: Number(text) };
  if (field.type === "money" || field.type === "integer") return parseNumber(field, text);
  if (field.maxLength && text.length > field.maxLength) {
    return { error: `${field.label} can be at most ${field.maxLength} characters.` };
  }
  return { value: text };
};

// Returns { data } ready to send to the API, or { errors } keyed by field name
export const parseValues = (fields, values) => {
  const data = {};
  const errors = {};
  for (const field of fields) {
    const result = parseField(field, values[field.name]);
    if (result.error) errors[field.name] = result.error;
    else data[field.name] = result.value;
  }
  return Object.keys(errors).length > 0 ? { errors } : { data };
};

// The Active / Inactive field that every record type has
export const statusField = (hint) => ({ name: "active", label: "Status", type: "status", hint });
