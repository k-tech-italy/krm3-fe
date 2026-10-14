import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Breadcrumb from "./Breadcrumb.tsx";

describe("Breadcrumb", () => {
  const page = [
    {
      title: "Page0",
      url: "/",
      icon: <span data-testid="breadcrumb-test-icon" />,
    },
    {
      title: "Page1",
      url: "/page_1_url",
    },
    {
      title: "Page2",
      url: "/page_2_url",
    },
  ];

  function renderBreadcrumb() {
    return render(
      <MemoryRouter>
        <Breadcrumb page={page} />
      </MemoryRouter>
    );
  }

  it("renders correct urls", () => {
    renderBreadcrumb();
    expect(screen.getByTestId("breadcrumb-item-0").querySelector("a")).toHaveAttribute("href", "/");
    expect(screen.getByTestId("breadcrumb-item-1").querySelector("a")).toHaveAttribute(
      "href",
      "/page_1_url"
    );
  });

  it("renders correct text", () => {
    renderBreadcrumb();
    expect(screen.getByTestId("breadcrumb-item-1").querySelector("a")).toHaveTextContent("Page1");
    expect(screen.getByTestId("breadcrumb-item-2")).toHaveTextContent("Page2");
  });

  it("renders an optional icon", () => {
    renderBreadcrumb();
    const firstBreadcrumbItem = screen.getByTestId("breadcrumb-item-0");
    expect(within(firstBreadcrumbItem).getByTestId("breadcrumb-test-icon")).toBeInTheDocument();
    expect(firstBreadcrumbItem).toHaveTextContent("Page0");
  });

  it("renders the current page as non-clickable text", () => {
    renderBreadcrumb();
    const currentPageItem = screen.getByTestId("breadcrumb-item-2");
    expect(currentPageItem.querySelector("a")).not.toBeInTheDocument();
    expect(within(currentPageItem).getByText("Page2")).toHaveAttribute("aria-current", "page");
  });
});
