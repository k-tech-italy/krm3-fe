import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import Krm3Autocomplete, { matchesQuery } from "./Krm3Autocomplete";

const options = [
  { value: "1", label: "Alice Rossi" },
  { value: "2", label: "Bob Bianchi" },
  { value: "3", label: "Alba Bianchi" },
];

function Harness({ initial = [] as string[], onChange = vi.fn(), debounceMs = 0 }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <label htmlFor="ac">People</label>
      <Krm3Autocomplete
        id="ac"
        options={options}
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange(v);
        }}
        placeholder="Type a name"
        debounceMs={debounceMs}
      />
    </>
  );
}

const input = () => screen.getByRole("combobox");
const type = (text: string) => fireEvent.change(input(), { target: { value: text } });
const optionNames = () => screen.queryAllByRole("option").map((o) => o.textContent);

describe("Krm3Autocomplete", () => {
  it("matches every typed word, in any order", () => {
    expect(matchesQuery("Alba Bianchi", "bia al")).toBe(true);
    expect(matchesQuery("Alba Bianchi", "bob")).toBe(false);
    expect(matchesQuery("Alba Bianchi", "  ")).toBe(true);
  });

  it("suggests the matching options while typing", () => {
    render(<Harness />);
    expect(input()).toHaveAttribute("placeholder", "Type a name");
    type("bianchi");
    expect(optionNames()).toEqual(["Bob Bianchi", "Alba Bianchi"]);
    expect(input()).toHaveAttribute("aria-expanded", "true");
    type("zzz");
    expect(optionNames()).toEqual([]);
  });

  it("picks with the mouse and shows the choice as a removable chip", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    type("ali");
    fireEvent.mouseDown(screen.getByRole("option", { name: "Alice Rossi" }));
    expect(onChange).toHaveBeenLastCalledWith(["1"]);
    expect(screen.getByText("Alice Rossi")).toBeInTheDocument();
    expect(input()).toHaveValue("");

    // a chosen option is not suggested again
    type("al");
    expect(optionNames()).toEqual(["Alba Bianchi"]);

    fireEvent.click(screen.getByLabelText("Remove Alice Rossi"));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("picks with the keyboard without submitting the form", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    const onChange = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <Harness onChange={onChange} />
      </form>
    );
    type("bianchi");
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith(["3"]);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("removes the last chip with Backspace on an empty input", () => {
    const onChange = vi.fn();
    render(<Harness initial={["1", "2"]} onChange={onChange} />);
    fireEvent.keyDown(input(), { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith(["1"]);
  });

  it("closes the suggestions with Escape without letting it through", () => {
    const outer = vi.fn();
    document.addEventListener("keydown", outer);
    render(<Harness />);
    type("a");
    fireEvent.keyDown(input(), { key: "Escape" });
    expect(optionNames()).toEqual([]);
    expect(outer).not.toHaveBeenCalled();

    // with the list closed, Escape goes on (e.g. to close the popover)
    fireEvent.keyDown(input(), { key: "Escape" });
    expect(outer).toHaveBeenCalledTimes(1);
    document.removeEventListener("keydown", outer);
  });

  it("suggests nothing until minQueryLength characters are typed", () => {
    render(
      <Krm3Autocomplete
        id="ac"
        options={options}
        value={[]}
        onChange={vi.fn()}
        minQueryLength={3}
      />
    );
    fireEvent.focus(input());
    expect(optionNames()).toEqual([]);
    type("al");
    expect(optionNames()).toEqual([]);
    expect(input()).toHaveAttribute("aria-expanded", "false");
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    expect(optionNames()).toEqual([]);
    type("  a ");
    expect(optionNames()).toEqual([]);
    type("alb");
    expect(optionNames()).toEqual(["Alba Bianchi"]);
  });

  it("updates the suggestions after debounceMs without typing", () => {
    vi.useFakeTimers();
    try {
      render(<Harness debounceMs={400} />);
      type("bia");
      expect(optionNames()).toEqual([]);
      act(() => vi.advanceTimersByTime(399));
      expect(optionNames()).toEqual([]);
      act(() => vi.advanceTimersByTime(1));
      expect(optionNames()).toEqual(["Bob Bianchi", "Alba Bianchi"]);

      // still the old suggestions while typing, the new ones after the pause
      type("bob");
      act(() => vi.advanceTimersByTime(200));
      expect(optionNames()).toEqual(["Bob Bianchi", "Alba Bianchi"]);
      act(() => vi.advanceTimersByTime(200));
      expect(optionNames()).toEqual(["Bob Bianchi"]);

      // picking empties the query, which acts at once: no stale suggestions for "bob"
      fireEvent.mouseDown(screen.getByRole("option", { name: "Bob Bianchi" }));
      expect(optionNames()).toEqual(["Alice Rossi", "Alba Bianchi"]);
    } finally {
      vi.useRealTimers();
    }
  });
});
