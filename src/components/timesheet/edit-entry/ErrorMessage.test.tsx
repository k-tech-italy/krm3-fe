import { render, screen } from "@testing-library/react";
import ErrorMessage from "./ErrorMessage";
describe("ErrorMessage", () => {
  it("renders with default message if no message prop is provided", () => {
    render(<ErrorMessage />);
    expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
  });
  it("renders with a custom message", () => {
    render(<ErrorMessage message="Custom error!" />);
    expect(screen.getByText(/custom error!/i)).toBeInTheDocument();
  });
}); 