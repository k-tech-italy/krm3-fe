import { render, screen } from "@testing-library/react";
import { Welcome } from "./Welcome";

describe("Welcome", () => {
  it("renders welcome message and text", () => {
    render(<Welcome />);

    expect(screen.getByText("Welcome!")).toBeInTheDocument();
    expect(screen.getByText("This is the welcome page. Please use the navigation to continue.")).toBeInTheDocument();
  });
});