import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Open/close state of a popover anchored to a button.
 *
 * When it opens, the first focusable element of the panel gets the focus. Escape closes it and gives the
 * focus back to the button; a mousedown outside the container closes it.
 */
export function usePopover() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("input, select, button")?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function onMouseDown(e: MouseEvent) {
      // composedPath(), not contains(e.target): the path is fixed when the event is dispatched, while the
      // target may already be detached (e.g. a picked autocomplete suggestion, removed by the re-render
      // React flushes before this listener runs)
      if (containerRef.current && !e.composedPath().includes(containerRef.current)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [open, close]);

  return { open, setOpen, close, containerRef, buttonRef, panelRef };
}
