import { useCallback, useState } from "react";

const PREFIX = "krm3.columns.";

function readStored(key: string): string[] | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.every((v) => typeof v === "string") ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Visible columns of a table, remembered per browser under `storageKey`.
 * Columns not in `defaultHidden` are shown until the user changes the choice.
 */
export function useColumnVisibility(
  storageKey: string,
  columns: { accessorKey: string }[],
  defaultHidden: string[] = []
) {
  const all = columns.map((c) => c.accessorKey);
  const defaults = all.filter((k) => !defaultHidden.includes(k));
  const [stored, setStored] = useState<string[] | null>(() => readStored(storageKey));

  // ignore stored columns that the table no longer has
  const kept = stored?.filter((k) => all.includes(k));
  const visible = kept && kept.length > 0 ? kept : defaults;

  const setVisible = useCallback(
    (next: string[] | null) => {
      setStored(next);
      try {
        if (next) localStorage.setItem(PREFIX + storageKey, JSON.stringify(next));
        else localStorage.removeItem(PREFIX + storageKey);
      } catch {
        // storage unavailable (private mode, blocked): the choice lasts until reload
      }
    },
    [storageKey]
  );

  return {
    visible,
    setVisible: (next: string[]) => setVisible(next),
    reset: () => setVisible(null),
    visibleColumns: <T extends { accessorKey: string }>(cols: T[]) =>
      cols.filter((c) => visible.includes(c.accessorKey)),
  };
}
