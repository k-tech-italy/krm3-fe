import { render, screen } from "@testing-library/react";
import Timesheet from "./Timesheet";
import { vi } from "vitest";

vi.mock("../components/timesheet/SelectResource", () => ({ __esModule: true, default: ({ setSelectedResourceId }: any) => <button onClick={() => setSelectedResourceId(42)}>SelectResource</button> }));
vi.mock("../components/timesheet/Krm3Calendar", () => ({ __esModule: true, default: ({ selectedResourceId }: any) => <div>Calendar:{selectedResourceId ?? ""}</div> }));

describe("Timesheet", () => {
  it("renders SelectResourceComponent and Krm3Calendar", () => {
    render(<Timesheet />);
    expect(screen.getByText(/selectresource/i)).toBeInTheDocument();
    expect(screen.getByText("Calendar:")).toBeInTheDocument();
  });
}); 