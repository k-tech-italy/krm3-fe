import { render } from "@testing-library/react";
import { EmptyCell } from "./EmptyCell";

test("renders EmptyCell with plus icon", () => {
  const { container } = render(
    <EmptyCell day={new Date()} taskId={1} isMonthView={false} />
  );
  expect(container.querySelector("svg.lucide.lucide-plus")).toBeInTheDocument();
}); 