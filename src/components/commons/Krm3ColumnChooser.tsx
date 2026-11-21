import { Columns3 } from "lucide-react";
import { usePopover } from "../../hooks/usePopover";

export interface ChoosableColumn {
  accessorKey: string;
  header: string;
}

interface Props {
  columns: ChoosableColumn[];
  /** accessorKeys of the visible columns. */
  visible: string[];
  onChange: (visible: string[]) => void;
  /** Restores the default columns. */
  onReset?: () => void;
  title?: string;
  testId?: string;
}

/**
 * A button that opens the list of a table's columns, to show or hide them.
 * Changes apply immediately; the last visible column cannot be hidden.
 */
export default function Krm3ColumnChooser({
  columns,
  visible,
  onChange,
  onReset,
  title = "Columns",
  testId = "columns",
}: Props) {
  const { open, setOpen, close, containerRef, buttonRef, panelRef } = usePopover();

  function toggle(key: string) {
    // keep the table's column order, whatever the order of the clicks
    const next = visible.includes(key) ? visible.filter((k) => k !== key) : [...visible, key];
    onChange(columns.map((c) => c.accessorKey).filter((k) => next.includes(k)));
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        data-testid={`${testId}-button`}
        aria-label={title}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={title}
        onClick={() => (open ? close() : setOpen(true))}
        className="p-2 rounded-md border border-app text-app hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Columns3 size={18} />
      </button>
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={title}
          data-testid={`${testId}-panel`}
          className="absolute right-0 z-30 mt-2 w-56 rounded-lg border border-app bg-card p-4 shadow-lg"
        >
          <p className="text-base font-semibold text-app mb-3">{title}</p>
          <div className="space-y-1">
            {columns.map((column) => {
              const checked = visible.includes(column.accessorKey);
              return (
                <label
                  key={column.accessorKey}
                  className="flex items-center gap-2 text-sm text-app"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={checked && visible.length === 1}
                    onChange={() => toggle(column.accessorKey)}
                  />
                  {column.header}
                </label>
              );
            })}
          </div>
          {onReset && (
            <button
              type="button"
              data-testid={`${testId}-reset`}
              onClick={onReset}
              className="mt-3 px-3 py-1 text-sm rounded-md border border-app text-app hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
}
