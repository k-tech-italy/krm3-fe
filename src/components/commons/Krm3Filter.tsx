import { FormEvent, useState } from "react";
import { Funnel } from "lucide-react";
import { usePopover } from "../../hooks/usePopover";
import Krm3Autocomplete from "./Krm3Autocomplete";
import { DefaultFilterLoader, SavedFilterPicker, SaveFilterAs } from "./Krm3SavedFilters";
import { normalizeRelativePeriod, parseRelativePeriod } from "./relativePeriod";

export type FilterValue = string | string[];
export type FilterValues = Record<string, FilterValue>;

export interface FilterOption {
  value: string;
  label: string;
}

/** One field of the filter form. Each page declares its own list. */
export type FilterField =
  | { name: string; label: string; type: "text" | "number" | "date"; placeholder?: string }
  | { name: string; label: string; type: "select"; options: FilterOption[]; placeholder?: string }
  | { name: string; label: string; type: "multiselect"; options: FilterOption[] }
  /** Several values picked by typing: for long lists (e.g. resources). */
  | {
      name: string;
      label: string;
      type: "autocomplete";
      options: FilterOption[];
      placeholder?: string;
      /** Characters to type before suggestions are shown. */
      minQueryLength?: number;
      /** Milliseconds without typing before the suggestions follow the query. */
      debounceMs?: number;
    }
  /**
   * "Last ...": a period ending today, e.g. "30d", "3m", "1a" (see relativePeriod.ts). When set, it replaces
   * the values of the `fromField` and `toField` date fields.
   */
  | {
      name: string;
      label: string;
      type: "relativePeriod";
      fromField: string;
      toField: string;
      placeholder?: string;
    };

/** A "Last ..." field for the given from/to date fields. */
export function lastPeriodField(fromField = "dateFrom", toField = "dateTo"): FilterField {
  return {
    name: "last",
    label: "Last",
    type: "relativePeriod",
    fromField,
    toField,
    placeholder: "e.g. 30d, 3m, 1a",
  };
}

/** Field types whose value is a list. */
export function isMultiValueField(field: FilterField): boolean {
  return field.type === "multiselect" || field.type === "autocomplete";
}

interface Props {
  fields: FilterField[];
  /** The applied values, e.g. read from the URL. */
  values: FilterValues;
  /**
   * Called with the non-empty values when the form is submitted, or with {} when it is cleared.
   * `replace` is set when the values are applied without a user action (the default filter of the page).
   */
  onSubmit: (values: FilterValues, options?: { replace?: boolean }) => void;
  title?: string;
  testId?: string;
  /**
   * The page or table the filter belongs to, e.g. "missions": when set, the user can save the filter
   * with a name ("Save as") and apply the filters saved for the page.
   */
  savedFiltersPage?: string;
}

export function isEmptyFilterValue(value: FilterValue | undefined): boolean {
  return value === undefined || (Array.isArray(value) ? value.length === 0 : value.trim() === "");
}

export function countActiveFilters(fields: FilterField[], values: FilterValues): number {
  return fields.filter((field) => !isEmptyFilterValue(values[field.name])).length;
}

/**
 * The values of the given fields, without empty ones and with text values trimmed.
 * A "Last ..." period is written in its canonical form and replaces its from/to dates.
 */
export function compact(fields: FilterField[], values: FilterValues): FilterValues {
  const result: FilterValues = {};
  for (const field of fields) {
    const value = values[field.name];
    if (!isEmptyFilterValue(value)) {
      if (Array.isArray(value)) result[field.name] = value;
      else
        result[field.name] =
          field.type === "relativePeriod" ? normalizeRelativePeriod(value) : value.trim();
    }
  }
  for (const field of fields) {
    if (field.type === "relativePeriod" && result[field.name] !== undefined) {
      delete result[field.fromField];
      delete result[field.toField];
    }
  }
  return result;
}

/** Error messages of the fields whose value is not valid, by field name. */
export function validateFilter(
  fields: FilterField[],
  values: FilterValues
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = values[field.name];
    if (field.type === "relativePeriod" && typeof value === "string" && value.trim() !== "") {
      if (!parseRelativePeriod(value)) {
        errors[field.name] =
          "Use a number followed by d (days), m (months) or a (years), e.g. 30d.";
      }
    }
  }
  return errors;
}

const inputClass =
  "w-full rounded-md border border-app bg-card text-app text-sm p-2 focus:outline-none focus:ring-2 focus:ring-krm3-primary";

/**
 * A funnel button that opens a filters form in a popover.
 *
 * The form edits a draft copy of `values`: submitting applies it and closes the popover,
 * Escape or a click outside closes it without applying. The funnel shows how many filters are active.
 */
export default function Krm3Filter({
  fields,
  values,
  onSubmit,
  title = "Filters",
  testId = "filter",
  savedFiltersPage,
}: Props) {
  const { open, setOpen, close, containerRef, buttonRef, panelRef } = usePopover();
  const [draft, setDraft] = useState<FilterValues>(values);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const active = countActiveFilters(fields, values);
  // date fields replaced by a "Last ..." period being edited
  const replacedDates = new Set(
    fields.flatMap((field) =>
      field.type === "relativePeriod" && !isEmptyFilterValue(draft[field.name])
        ? [field.fromField, field.toField]
        : []
    )
  );

  function toggle() {
    if (open) {
      close();
    } else {
      setDraft(values);
      setErrors({});
      setOpen(true);
    }
  }

  function setField(name: string, value: FilterValue) {
    setDraft((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const rest = { ...prev };
      delete rest[name];
      return rest;
    });
  }

  /** Show the errors of the draft; true when it can be applied or saved. */
  function checkDraft(): boolean {
    const found = validateFilter(fields, draft);
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  function toggleOption(name: string, option: string) {
    const current = draft[name];
    const selected = Array.isArray(current) ? current : [];
    setField(
      name,
      selected.includes(option) ? selected.filter((v) => v !== option) : [...selected, option]
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!checkDraft()) return;
    onSubmit(compact(fields, draft));
    close();
  }

  function apply(values: FilterValues) {
    onSubmit(values);
    close();
  }

  function handleClear() {
    setDraft({});
    onSubmit({});
    close();
  }

  function renderField(field: FilterField) {
    const id = `${testId}-${field.name}`;
    const value = draft[field.name];
    if (field.type === "autocomplete") {
      return (
        <div key={field.name} className="mb-3">
          <label htmlFor={id} className="block text-sm font-medium text-app mb-1">
            {field.label}
          </label>
          <Krm3Autocomplete
            id={id}
            options={field.options}
            value={Array.isArray(value) ? value : []}
            onChange={(selected) => setField(field.name, selected)}
            placeholder={field.placeholder}
            minQueryLength={field.minQueryLength}
            debounceMs={field.debounceMs}
          />
        </div>
      );
    }
    if (field.type === "multiselect") {
      const selected = Array.isArray(value) ? value : [];
      return (
        <fieldset key={field.name} className="mb-3">
          <legend className="block text-sm font-medium text-app mb-1">{field.label}</legend>
          <div className="max-h-40 overflow-y-auto rounded-md border border-app p-2 space-y-1">
            {field.options.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm text-app">
                <input
                  type="checkbox"
                  name={field.name}
                  value={option.value}
                  checked={selected.includes(option.value)}
                  onChange={() => toggleOption(field.name, option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      );
    }
    const stringValue = typeof value === "string" ? value : "";
    return (
      <div key={field.name} className="mb-3">
        <label htmlFor={id} className="block text-sm font-medium text-app mb-1">
          {field.label}
        </label>
        {field.type === "select" ? (
          <select
            id={id}
            className={inputClass}
            value={stringValue}
            onChange={(e) => setField(field.name, e.target.value)}
          >
            <option value="">{field.placeholder ?? "All"}</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={field.type === "relativePeriod" ? "text" : field.type}
            className={`${inputClass} disabled:opacity-50`}
            placeholder={field.placeholder}
            value={stringValue}
            disabled={replacedDates.has(field.name)}
            aria-invalid={field.name in errors}
            aria-describedby={field.name in errors ? `${id}-error` : undefined}
            onChange={(e) => setField(field.name, e.target.value)}
          />
        )}
        {replacedDates.has(field.name) && (
          <p className="text-xs text-app opacity-70 mt-1">
            Replaced by the &quot;Last&quot; period.
          </p>
        )}
        {errors[field.name] && (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-xs text-red-600 dark:text-red-400 mt-1"
          >
            {errors[field.name]}
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      {savedFiltersPage && (
        <DefaultFilterLoader
          page={savedFiltersPage}
          fields={fields}
          values={values}
          onApply={(defaultValues) => onSubmit(defaultValues, { replace: true })}
        />
      )}
      <button
        ref={buttonRef}
        type="button"
        data-testid={`${testId}-button`}
        aria-label={active ? `${title} (${active} active)` : title}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={title}
        onClick={toggle}
        className={`relative p-2 rounded-md border border-app hover:bg-gray-100 dark:hover:bg-gray-700 ${
          active ? "text-krm3-primary" : "text-app"
        }`}
      >
        <Funnel size={18} fill={active ? "currentColor" : "none"} />
        {active > 0 && (
          <span
            data-testid={`${testId}-badge`}
            className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-krm3-primary text-black text-[10px] leading-4 text-center"
          >
            {active}
          </span>
        )}
      </button>
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={title}
          data-testid={`${testId}-panel`}
          className="absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-app bg-card p-4 shadow-lg"
        >
          <form onSubmit={handleSubmit}>
            <p className="text-base font-semibold text-app mb-3">{title}</p>
            {savedFiltersPage && (
              <SavedFilterPicker
                page={savedFiltersPage}
                fields={fields}
                testId={testId}
                onApply={apply}
              />
            )}
            {fields.map(renderField)}
            {savedFiltersPage && (
              <SaveFilterAs
                page={savedFiltersPage}
                fields={fields}
                testId={testId}
                draft={draft}
                isValid={checkDraft}
                onSaved={apply}
              />
            )}
            <div className="flex justify-between gap-2 mt-4">
              <button
                type="button"
                data-testid={`${testId}-clear`}
                onClick={handleClear}
                className="px-3 py-2 text-sm rounded-md border border-app text-app hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Clear
              </button>
              <button
                type="submit"
                data-testid={`${testId}-submit`}
                className="px-3 py-2 text-sm rounded-md bg-krm3-primary text-black hover:bg-krm3-primary-dark"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
