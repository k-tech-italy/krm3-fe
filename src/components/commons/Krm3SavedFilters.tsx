import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useSavedFilters, useSaveFilter } from "../../hooks/useSavedFilters";
import { applyFilters } from "../../hooks/useListParams";
import {
  compact,
  countActiveFilters,
  FilterField,
  FilterValues,
  isEmptyFilterValue,
} from "./Krm3Filter";
import { describeRelativePeriod } from "./relativePeriod";

const inputClass =
  "w-full rounded-md border border-app bg-card text-app text-sm p-2 focus:outline-none focus:ring-2 focus:ring-krm3-primary";
const secondaryButtonClass =
  "px-3 py-2 text-sm rounded-md border border-app text-app hover:bg-gray-100 dark:hover:bg-gray-700";

interface Props {
  /** The page or table the filters belong to, e.g. "missions". */
  page: string;
  fields: FilterField[];
  testId: string;
}

/** The filter as people read it, e.g. "Status: Draft, Submitted; From: 2025-01-01". */
export function describeFilter(fields: FilterField[], values: FilterValues): string {
  return fields
    .filter((field) => !isEmptyFilterValue(values[field.name]))
    .map((field) => {
      const value = values[field.name];
      if (field.type === "relativePeriod" && !Array.isArray(value)) {
        return `${field.label}: ${describeRelativePeriod(value)}`;
      }
      const items = Array.isArray(value) ? value : [value.trim()];
      const labels =
        "options" in field
          ? items.map(
              (item) => field.options.find((option) => option.value === item)?.label ?? item
            )
          : items;
      return `${field.label}: ${labels.join(", ")}`;
    })
    .join("; ");
}

/** The address of the current page with the filter applied, as the list reads it from the URL. */
export function filterUrl(fields: FilterField[], values: FilterValues): string {
  const params = new URLSearchParams(window.location.search);
  applyFilters(params, fields, values);
  const query = params.toString();
  return window.location.pathname + (query ? `?${query}` : "");
}

/** A select listing the user's saved filters for the page: picking one applies it. */
export function SavedFilterPicker({
  page,
  fields,
  testId,
  onApply,
}: Props & { onApply: (values: FilterValues) => void }) {
  const { data: saved = [] } = useSavedFilters(page);
  if (saved.length === 0) return null;
  const id = `${testId}-saved`;
  return (
    <div className="mb-3 pb-3 border-b border-app">
      <label htmlFor={id} className="block text-sm font-medium text-app mb-1">
        Saved filters
      </label>
      <select
        id={id}
        data-testid={id}
        className={inputClass}
        value=""
        onChange={(e) => {
          const picked = saved.find((item) => String(item.id) === e.target.value);
          if (picked) onApply(compact(fields, picked.values));
        }}
      >
        <option value="">Choose a saved filter...</option>
        {saved.map((item) => (
          <option key={item.id} value={item.id}>
            {item.isDefault ? `${item.name} (default)` : item.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * "Save as": saves the values being edited with a name, then applies them.
 * Saving with the name of an existing filter of the page replaces it, after confirmation.
 */
export function SaveFilterAs({
  page,
  fields,
  testId,
  draft,
  isValid,
  onSaved,
}: Props & {
  draft: FilterValues;
  /** Shows the errors of the values being edited; true when they can be saved. */
  isValid: () => boolean;
  onSaved: (values: FilterValues) => void;
}) {
  const { data: saved = [] } = useSavedFilters(page);
  const { mutate, isLoading } = useSaveFilter(page);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = `${testId}-save-name`;

  function save() {
    if (!isValid()) {
      setError("Fix the filter before saving it.");
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a name for the filter.");
      return;
    }
    if (
      saved.some((item) => item.name === trimmed) &&
      !window.confirm(`Replace the saved filter "${trimmed}"?`)
    ) {
      return;
    }
    const values = compact(fields, draft);
    mutate(
      {
        name: trimmed,
        values,
        summary: describeFilter(fields, values),
        url: filterUrl(fields, values),
        isDefault,
      },
      {
        onSuccess: () => {
          setEditing(false);
          setName("");
          setIsDefault(false);
          setError(null);
          onSaved(values);
        },
        onError: () => setError("The filter could not be saved. Please try again."),
      }
    );
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // Enter saves the filter instead of submitting the filter form
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        data-testid={`${testId}-save-as`}
        onClick={() => setEditing(true)}
        className={`${secondaryButtonClass} w-full mt-1`}
      >
        Save as...
      </button>
    );
  }

  return (
    <div className="mt-1 pt-3 border-t border-app">
      <label htmlFor={id} className="block text-sm font-medium text-app mb-1">
        Filter name
      </label>
      <input
        id={id}
        data-testid={id}
        className={inputClass}
        value={name}
        maxLength={100}
        autoFocus
        onChange={(e) => {
          setName(e.target.value);
          setError(null);
        }}
        onKeyDown={handleKeyDown}
      />
      <label className="flex items-center gap-2 text-sm text-app mt-2">
        <input
          type="checkbox"
          data-testid={`${testId}-save-default`}
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />
        Default
        <span className="opacity-70">(applied when the page is opened without filters)</span>
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 mt-1">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          data-testid={`${testId}-save-cancel`}
          onClick={() => {
            setEditing(false);
            setError(null);
          }}
          className={secondaryButtonClass}
        >
          Cancel
        </button>
        <button
          type="button"
          data-testid={`${testId}-save-confirm`}
          disabled={isLoading}
          onClick={save}
          className="px-3 py-2 text-sm rounded-md bg-krm3-primary text-black hover:bg-krm3-primary-dark disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}

/**
 * Applies the default saved filter of the page once, when the page is opened without filters.
 * Renders nothing.
 */
export function DefaultFilterLoader({
  page,
  fields,
  values,
  onApply,
}: {
  page: string;
  fields: FilterField[];
  values: FilterValues;
  onApply: (values: FilterValues) => void;
}) {
  const { data: saved } = useSavedFilters(page);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current || saved === undefined) return;
    checkedRef.current = true;
    const defaultFilter = saved.find((item) => item.isDefault);
    if (defaultFilter && countActiveFilters(fields, values) === 0) {
      onApply(compact(fields, defaultFilter.values));
    }
  }, [saved, fields, values, onApply]);

  return null;
}
