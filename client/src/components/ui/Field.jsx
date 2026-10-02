import { Fragment, useId } from "react";
import Icon from "./Icon";
import { cn } from "@/lib/cn";

// Dark 1px border from the guideline's form inputs, violet focus ring
const controlClasses = cn(
  "w-full rounded-lg border border-ink/70 bg-white px-3 text-sm text-ink transition-colors",
  "placeholder:text-muted/70 disabled:bg-paper",
  "focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-hidden",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/20",
);

// Label, optional character counter, and the error or hint under the control
const Field = ({ id, label, required, error, hint, length, maxLength, children }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-baseline justify-between gap-4">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden="true" className="text-brand">
            {" "}
            *
          </span>
        )}
      </label>
      {length !== undefined && maxLength && (
        <span className="text-xs text-muted tabular-nums">
          {length}/{maxLength}
        </span>
      )}
    </div>
    {children}
    {error ? (
      <p id={`${id}-message`} className="flex items-center gap-1.5 text-xs text-danger">
        <Icon name="alert" size={14} className="shrink-0" />
        {error}
      </p>
    ) : (
      hint && (
        <p id={`${id}-message`} className="text-xs text-muted">
          {hint}
        </p>
      )
    )}
  </div>
);

// Props that connect a control to its label and message for screen readers
const controlA11yProps = (id, error, hint) => ({
  id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error || hint ? `${id}-message` : undefined,
});

// `suggestions` offers values to pick from while still allowing new ones
export const TextField = ({
  label,
  error,
  hint,
  showCount = false,
  suggestions,
  className,
  ...props
}) => {
  const id = useId();
  const listId = suggestions?.length ? `${id}-suggestions` : undefined;
  return (
    <Field
      id={id}
      label={label}
      required={props.required}
      error={error}
      hint={hint}
      length={showCount ? String(props.value ?? "").length : undefined}
      maxLength={props.maxLength}
    >
      <input
        {...controlA11yProps(id, error, hint)}
        list={listId}
        className={cn(controlClasses, "h-10", className)}
        {...props}
      />
      {listId && (
        <datalist id={listId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      )}
    </Field>
  );
};

export const TextAreaField = ({ label, error, hint, showCount = false, className, ...props }) => {
  const id = useId();
  return (
    <Field
      id={id}
      label={label}
      required={props.required}
      error={error}
      hint={hint}
      length={showCount ? String(props.value ?? "").length : undefined}
      maxLength={props.maxLength}
    >
      <textarea
        {...controlA11yProps(id, error, hint)}
        className={cn(controlClasses, "min-h-24 resize-y py-2", className)}
        {...props}
      />
    </Field>
  );
};

// Options with the same `group` are listed under that heading (<optgroup>)
const groupOptions = (options) => {
  const groups = new Map();
  for (const option of options) {
    const group = option.group ?? "";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(option);
  }
  return [...groups];
};

const renderOption = (option) => (
  <option key={option.value} value={option.value}>
    {option.label}
  </option>
);

// options: [{ value, label, group? }]. The placeholder option has the value "".
export const SelectField = ({ label, error, hint, options, placeholder, className, ...props }) => {
  const id = useId();
  return (
    <Field id={id} label={label} required={props.required} error={error} hint={hint}>
      <div className="relative">
        <select
          {...controlA11yProps(id, error, hint)}
          className={cn(controlClasses, "h-10 appearance-none pr-9", className)}
          {...props}
        >
          <option value="">{placeholder}</option>
          {groupOptions(options).map(([group, groupItems]) =>
            group ? (
              <optgroup key={group} label={group}>
                {groupItems.map(renderOption)}
              </optgroup>
            ) : (
              <Fragment key="ungrouped">{groupItems.map(renderOption)}</Fragment>
            ),
          )}
        </select>
        <Icon
          name="chevron-down"
          size={16}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted"
        />
      </div>
    </Field>
  );
};
