import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import Krm3Autocomplete, { matchesQuery } from "./Krm3Autocomplete";

const options = [
  { value: "1", label: "Alice Rossi" },
  { value: "2", label: "Bob Bianchi" },
  { value: "3", label: "Alba Bianchi" },
];

function Harness({ initial = [] as string[], onChange = vi.fn() }) {
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
});
