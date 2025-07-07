import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import WarningExistingEntry from "./WarningExistEntry";
describe("WarningExistingEntry", () => {
  it("does not render warning if daysWithTimeEntries is empty", () => {
    const { container } = render(
      <WarningExistingEntry daysWithTimeEntries={[]} isCheckbox={false} />
    );
    expect(container.querySelector("#warning-message")).toBeNull();
  });
  it("renders warning if daysWithTimeEntries is not empty", () => {
    render(
      <WarningExistingEntry daysWithTimeEntries={["2024-06-01"]} isCheckbox={false} />
    );
    expect(screen.getByText(/time entries already exist/i)).toBeInTheDocument();
  });
  it("renders custom message if provided", () => {
    render(
      <WarningExistingEntry daysWithTimeEntries={["2024-06-01"]} isCheckbox={false} message="Custom warning!" />
    );
    expect(screen.getByText(/custom warning!/i)).toBeInTheDocument();
  });
  it("renders checkbox and toggles overrideEntries", () => {
    const setOverrideEntries = vi.fn();
    render(
      <WarningExistingEntry
        daysWithTimeEntries={["2024-06-01"]}
        isCheckbox={true}
        overrideEntries={false}
        setOverrideEntries={setOverrideEntries}
      />
    );
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(setOverrideEntries).toHaveBeenCalled();
  });
}); 