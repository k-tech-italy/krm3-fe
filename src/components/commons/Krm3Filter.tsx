import { FormEvent, useState } from "react";
import { Funnel } from "lucide-react";
import { usePopover } from "../../hooks/usePopover";
import Krm3Autocomplete from "./Krm3Autocomplete";

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
    };

/** Field types whose value is a list. */
export function isMultiValueField(field: FilterField): boolean {
  return field.type === "multiselect" || field.type === "autocomplete";
}

interface Props {
  fields: FilterField[];
  /** The applied values, e.g. read from the URL. */
  values: FilterValues;
  /** Called with the non-empty values when the form is submitted, or with {} when it is cleared. */
  onSubmit: (values: FilterValues) => void;
  title?: string;
  testId?: string;
}

export function isEmptyFilterValue(value: FilterValue | undefined): boolean {
  return value === undefined || (Array.isArray(value) ? value.length === 0 : value.trim() === "");
}

export function countActiveFilters(fields: FilterField[], values: FilterValues): number {
  return fields.filter((field) => !isEmptyFilterValue(values[field.name])).length;
}

function compact(fields: FilterField[], values: FilterValues): FilterValues {
  const result: FilterValues = {};
  for (const field of fields) {
    const value = values[field.name];
    if (!isEmptyFilterValue(value)) {
      result[field.name] = Array.isArray(value) ? value : value.trim();
    }
  }
  return result;
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
}: Props) {
  const { open, setOpen, close, containerRef, buttonRef, panelRef } = usePopover();
  const [draft, setDraft] = useState<FilterValues>(values);
  const active = countActiveFilters(fields, values);

  function toggle() {
    if (open) {
      close();
    } else {
      setDraft(values);
      setOpen(true);
    }
  }

  function setField(name: string, value: FilterValue) {
    setDraft((prev) => ({ ...prev, [name]: value }));
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
    onSubmit(compact(fields, draft));
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
            type={field.type}
            className={inputClass}
            placeholder={field.placeholder}
            value={stringValue}
            onChange={(e) => setField(field.name, e.target.value)}
          />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block">
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
            {fields.map(renderField)}
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
