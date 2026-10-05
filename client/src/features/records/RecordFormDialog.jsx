import { useId, useRef, useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import ImageField from "@/components/ui/ImageField";
import Modal from "@/components/ui/Modal";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { capitalize } from "@/lib/format";
import { getErrorMessage, getErrorStatus } from "@/lib/http";
import { getInitialValues, parseValues } from "./formFields";

const STATUS_OPTIONS = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
];

// One form control, picked by the field's type (see formFields.js)
const FormControl = ({ field, value, error, options, suggestions, loading, autoFocus, onChange }) => {
  const statusLabelId = useId();

  if (field.type === "status") {
    return (
      <div className="flex flex-col gap-2">
        <span id={statusLabelId} className="text-sm font-medium">
          {field.label}
        </span>
        <SegmentedControl
          aria-labelledby={statusLabelId}
          options={STATUS_OPTIONS}
          value={value}
          onChange={onChange}
        />
        {field.hint && <p className="text-xs text-muted">{field.hint}</p>}
      </div>
    );
  }

  if (field.type === "image") {
    return (
      <ImageField
        label={field.label}
        hint={field.hint}
        value={value}
        onChange={onChange}
        error={error}
      />
    );
  }

  const shared = {
    name: field.name,
    label: field.label,
    required: field.required,
    hint: field.hint,
    placeholder: field.placeholder,
    error,
    value,
    "data-autofocus": autoFocus || undefined,
    onChange: (event) => onChange(event.target.value),
  };

  switch (field.type) {
    case "textarea":
      return <TextAreaField {...shared} rows={3} maxLength={field.maxLength} showCount />;
    case "select":
      return (
        <SelectField
          {...shared}
          options={options ?? []}
          disabled={loading}
          placeholder={loading ? "Loading…" : field.placeholder}
        />
      );
    case "money":
    case "integer":
      return (
        <TextField
          {...shared}
          inputMode={field.type === "money" ? "decimal" : "numeric"}
          autoComplete="off"
        />
      );
    default:
      return (
        <TextField
          {...shared}
          maxLength={field.maxLength}
          showCount={Boolean(field.maxLength)}
          suggestions={suggestions}
          autoComplete="off"
        />
      );
  }
};

// Add or edit form for any record type, built from config.form.fields.
// The parent's onSubmit sends the request and closes the dialog. If it throws,
// the error is shown here: a 409 (duplicate) on the field config.form.getConflict
// names, anything else above the form.
//
// lookups: lists that select fields pick from, e.g. { categories, brands }
// lookupState: { loading, error, retry } while those lists load
const RecordFormDialog = ({ config, record, records, lookups, lookupState, onSubmit, onClose }) => {
  const { noun, form } = config;
  const formId = useId();
  const formRef = useRef(null);
  const isEditing = Boolean(record);

  const [initialValues] = useState(() => getInitialValues(form.fields, record));
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const hasChanges = form.fields.some((field) => values[field.name] !== initialValues[field.name]);
  // Focus starts in the first field you type in, not on the image or status
  const autoFocusName = form.fields.find(
    (field) => field.type !== "image" && field.type !== "status",
  )?.name;

  const focusField = (name) => formRef.current?.elements.namedItem(name)?.focus();

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { data, errors: fieldErrors } = parseValues(form.fields, values);
    if (fieldErrors) {
      setErrors(fieldErrors);
      focusField(form.fields.find((field) => fieldErrors[field.name]).name);
      return;
    }

    setSubmitting(true);
    setErrors({});
    setFormError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      const conflict =
        getErrorStatus(err) === 409 && form.getConflict?.(err.response?.data?.message ?? "");
      if (conflict) {
        setErrors({ [conflict.field]: conflict.message });
        focusField(conflict.field);
      } else {
        setFormError(getErrorMessage(err));
      }
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      size={form.size}
      onClose={onClose}
      dismissible={!submitting}
      title={`${isEditing ? "Edit" : "New"} ${noun.singular}`}
      description={isEditing ? form.editDescription : form.createDescription}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            loading={submitting}
            disabled={(isEditing && !hasChanges) || lookupState?.loading}
          >
            {isEditing ? "Save Changes" : `Add ${capitalize(noun.singular)}`}
          </Button>
        </>
      }
    >
      <form
        ref={formRef}
        id={formId}
        noValidate
        onSubmit={handleSubmit}
        className="grid gap-6 sm:grid-cols-2"
      >
        {lookupState?.error && (
          <div className="sm:col-span-2">
            <Alert
              action={
                <Button variant="outline" size="sm" onClick={lookupState.retry}>
                  Try Again
                </Button>
              }
            >
              {lookupState.error}
            </Alert>
          </div>
        )}
        {formError && (
          <div className="sm:col-span-2">
            <Alert>{formError}</Alert>
          </div>
        )}

        {form.fields.map((field) => (
          <div key={field.name} className={field.half ? undefined : "sm:col-span-2"}>
            <FormControl
              field={field}
              value={values[field.name]}
              error={errors[field.name]}
              options={field.options?.({ lookups, record })}
              suggestions={field.suggestions?.({ records })}
              loading={lookupState?.loading}
              autoFocus={field.name === autoFocusName}
              onChange={(value) => setValue(field.name, value)}
            />
          </div>
        ))}
      </form>
    </Modal>
  );
};

export default RecordFormDialog;
