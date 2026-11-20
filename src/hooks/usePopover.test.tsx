import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { usePopover } from "./usePopover";

function Popover() {
  const { open, setOpen, containerRef, buttonRef, panelRef } = usePopover();
  const [items, setItems] = useState(["a", "b"]);
  return (
    <div>
      <span data-testid="outside">outside</span>
      <div ref={containerRef}>
        <button ref={buttonRef} onClick={() => setOpen(!open)}>
          toggle
        </button>
        {open && (
          <div ref={panelRef} data-testid="panel">
            {items.map((item) => (
              <span key={item} data-testid={`item-${item}`}>
                {item}
              </span>
            ))}
            <button onClick={() => setItems([])}>empty</button>
          </div>
        )}
      </div>
    </div>
  );
}

describe("usePopover", () => {
  it("closes on a mousedown outside the container", () => {
    render(<Popover />);
    fireEvent.click(screen.getByText("toggle"));
    fireEvent.mouseDown(screen.getByTestId("item-a"));
    expect(screen.getByTestId("panel")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
  });

  it("stays open when the element pressed inside is removed while the event is dispatched", () => {
    // in the browser React re-renders (e.g. a picked autocomplete suggestion disappears) before the
    // document listener runs; here the target detaches itself to reproduce that order
    render(<Popover />);
    fireEvent.click(screen.getByText("toggle"));
    const item = screen.getByTestId("item-a");
    item.addEventListener("mousedown", () => item.remove());
    fireEvent.mouseDown(item);
    expect(item.isConnected).toBe(false);
    expect(screen.getByTestId("panel")).toBeInTheDocument();
  });
});
