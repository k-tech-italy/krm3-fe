import { KeyboardEvent, useId, useMemo, useState } from "react";
import { X } from "lucide-react";

export interface AutocompleteOption {
  value: string;
  label: string;
}

interface Props {
  id: string;
  options: AutocompleteOption[];
  /** Selected option values. */
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /** Most suggestions shown at once. */
  maxSuggestions?: number;
}

/** Every typed word must appear in the label, in any order, ignoring case. */
export function matchesQuery(label: string, query: string): boolean {
  const text = label.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));
}

/**
 * Multi-value autocomplete: the selected options are shown as removable chips, typing suggests
 * the matching ones. Keyboard: arrows move in the suggestions, Enter picks, Escape closes the list,
 * Backspace on an empty input removes the last chip.
 */
export default function Krm3Autocomplete({
  id,
  options,
  value,
  onChange,
  placeholder,
  maxSuggestions = 50,
}: Props) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const labels = useMemo(() => new Map(options.map((o) => [o.value, o.label])), [options]);
  const suggestions = useMemo(
    () =>
      options
        .filter((o) => !value.includes(o.value) && matchesQuery(o.label, query))
        .slice(0, maxSuggestions),
    [options, value, query, maxSuggestions]
  );
  const showList = listOpen && suggestions.length > 0;

  function pick(option: AutocompleteOption) {
    onChange([...value, option.value]);
    setQuery("");
    setHighlighted(0);
  }

  function remove(optionValue: string) {
    onChange(value.filter((v) => v !== optionValue));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setListOpen(true);
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      // never submit the surrounding form from here
      e.preventDefault();
      if (showList && suggestions[highlighted]) pick(suggestions[highlighted]);
    } else if (e.key === "Escape" && showList) {
      // close the suggestions only, not the popover containing the field
      e.stopPropagation();
      setListOpen(false);
    } else if (e.key === "Backspace" && query === "" && value.length > 0) {
      remove(value[value.length - 1]);
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1 rounded-md border border-app bg-card p-1 focus-within:ring-2 focus-within:ring-krm3-primary">
        {value.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded bg-krm3-primary-light text-black text-xs px-2 py-0.5"
          >
            {labels.get(v) ?? v}
            <button
              type="button"
              aria-label={`Remove ${labels.get(v) ?? v}`}
              onClick={() => remove(v)}
              className="hover:text-krm3-danger"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList ? `${listId}-${highlighted}` : undefined}
          className="flex-1 min-w-24 bg-transparent text-app text-sm p-1 focus:outline-none"
          placeholder={value.length ? undefined : placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
            setListOpen(true);
          }}
          onFocus={() => setListOpen(true)}
          onBlur={() => setListOpen(false)}
          onKeyDown={onKeyDown}
        />
      </div>
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-40 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-app bg-card shadow-lg"
        >
          {suggestions.map((option, i) => (
            <li
              key={option.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === highlighted}
              // mousedown, not click: picking must happen before the input loses the focus
              onMouseDown={(e) => {
                e.preventDefault();
                pick(option);
              }}
              onMouseEnter={() => setHighlighted(i)}
              className={`cursor-pointer px-2 py-1 text-sm text-app ${
                i === highlighted ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
