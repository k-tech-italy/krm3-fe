import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import LimitBudget from "./LimitBudget";
import * as useExpense from "../../../hooks/useExpense";
import * as useView from "../../../hooks/useView";
import { Category, LimitBudget as LimitBudgetType } from "../../../restapi/types";

vi.mock("../../../hooks/useExpense");
vi.mock("../../../hooks/useView");

describe("LimitBudget", () => {
  const mockCategory: Category = {
    id: 1,
    title: "Vitto",
    active: true,
    str: "vitto",
    parent: undefined,
  };

  const mockCategoryList: Category[] = [
    mockCategory,
    {
      id: 2,
      title: "Viaggi",
      active: true,
      str: "viaggi",
      parent: undefined,
    },
  ];

  const mockBudgetLimit: LimitBudgetType = {
    vitto: 50,
    viaggi: 100,
    varie: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render with default text when budgetResidue is null", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={10}
          categoryList={mockCategoryList}
        />
      );

      expect(screen.getByText(/Budget residuo/)).toBeInTheDocument();
      expect(screen.getByText(/da definire/)).toBeInTheDocument();
    });

    it("should render on large screen without mt-1 class", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      const { container } = render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={10}
          categoryList={mockCategoryList}
        />
      );

      const paragraph = container.querySelector("p");
      expect(paragraph).toHaveClass("ms-1");
      expect(paragraph).not.toHaveClass("mt-1");
    });

    it("should render on small screen with mt-1 class", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(true);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      const { container } = render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={10}
          categoryList={mockCategoryList}
        />
      );

      const paragraph = container.querySelector("p");
      expect(paragraph).toHaveClass("mt-1");
      expect(paragraph).not.toHaveClass("ms-1");
    });

    it("should render with p-1 and mb-0 classes", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      const { container } = render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={10}
          categoryList={mockCategoryList}
        />
      );

      const paragraph = container.querySelector("p");
      expect(paragraph).toHaveClass("p-1");
      expect(paragraph).toHaveClass("mb-0");
    });
  });

  describe("budget limit data", () => {
    it("should handle undefined budget limit data", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: undefined,
      } as any);

      render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={10}
          categoryList={mockCategoryList}
        />
      );

      expect(screen.getByText(/da definire/)).toBeInTheDocument();
    });

    it("should handle null budget limit data", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: null,
      } as any);

      render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={10}
          categoryList={mockCategoryList}
        />
      );

      expect(screen.getByText(/da definire/)).toBeInTheDocument();
    });

    it("should work with different budget limit values", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: {
          vitto: 200,
          viaggi: 300,
          varie: 150,
        },
      } as any);

      render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={50}
          categoryList={mockCategoryList}
        />
      );

      expect(screen.getByText(/Budget residuo/)).toBeInTheDocument();
    });
  });

  describe("category handling", () => {
    it("should handle category with parent", () => {
      const categoryWithParent: Category = {
        id: 3,
        title: "SubCategory",
        active: true,
        str: "subcategory",
        parent: mockCategory,
      };

      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      render(
        <LimitBudget
          category={categoryWithParent}
          amountCurrency={20}
          categoryList={mockCategoryList}
        />
      );

      expect(screen.getByText(/da definire/)).toBeInTheDocument();
    });

    it("should handle different category types", () => {
      const viaggiCategory: Category = {
        id: 2,
        title: "Viaggi",
        active: true,
        str: "viaggi",
        parent: undefined,
      };

      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      render(
        <LimitBudget
          category={viaggiCategory}
          amountCurrency={30}
          categoryList={mockCategoryList}
        />
      );

      expect(screen.getByText(/Budget residuo/)).toBeInTheDocument();
    });

    it("should handle varie category", () => {
      const varieCategory: Category = {
        id: 3,
        title: "Varie",
        active: true,
        str: "varie",
        parent: undefined,
      };

      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      render(
        <LimitBudget
          category={varieCategory}
          amountCurrency={25}
          categoryList={mockCategoryList}
        />
      );

      expect(screen.getByText(/da definire/)).toBeInTheDocument();
    });
  });

  describe("amount handling", () => {
    it("should handle zero amount", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={0}
          categoryList={mockCategoryList}
        />
      );

      expect(screen.getByText(/Budget residuo/)).toBeInTheDocument();
    });

    it("should handle negative amount", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={-10}
          categoryList={mockCategoryList}
        />
      );

      expect(screen.getByText(/Budget residuo/)).toBeInTheDocument();
    });

    it("should handle large amount", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={1000}
          categoryList={mockCategoryList}
        />
      );

      expect(screen.getByText(/Budget residuo/)).toBeInTheDocument();
    });

    it("should handle decimal amount", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={10.55}
          categoryList={mockCategoryList}
        />
      );

      expect(screen.getByText(/Budget residuo/)).toBeInTheDocument();
    });
  });

  describe("categoryList variations", () => {
    it("should handle empty category list", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={10}
          categoryList={[]}
        />
      );

      expect(screen.getByText(/Budget residuo/)).toBeInTheDocument();
    });

    it("should handle large category list", () => {
      const largeCategoryList: Category[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Category ${i + 1}`,
        active: true,
        str: `category_${i + 1}`,
        parent: undefined,
      }));

      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={10}
          categoryList={largeCategoryList}
        />
      );

      expect(screen.getByText(/Budget residuo/)).toBeInTheDocument();
    });
  });

  describe("media query integration", () => {
    it("should respond to media query changes (small screen)", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(true);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      const { container } = render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={10}
          categoryList={mockCategoryList}
        />
      );

      const paragraph = container.querySelector("p");
      expect(paragraph).toHaveClass("mt-1");
    });

    it("should respond to media query changes (large screen)", () => {
      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      const { container } = render(
        <LimitBudget
          category={mockCategory}
          amountCurrency={10}
          categoryList={mockCategoryList}
        />
      );

      const paragraph = container.querySelector("p");
      expect(paragraph).toHaveClass("ms-1");
    });
  });

  describe("edge cases", () => {
    it("should handle case insensitive category title matching", () => {
      const upperCaseCategory: Category = {
        id: 1,
        title: "VITTO",
        active: true,
        str: "vitto",
        parent: undefined,
      };

      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      render(
        <LimitBudget
          category={upperCaseCategory}
          amountCurrency={10}
          categoryList={mockCategoryList}
        />
      );

      expect(screen.getByText(/Budget residuo/)).toBeInTheDocument();
    });

    it("should handle missing category in budget limit", () => {
      const unknownCategory: Category = {
        id: 99,
        title: "Unknown",
        active: true,
        str: "unknown",
        parent: undefined,
      };

      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      render(
        <LimitBudget
          category={unknownCategory}
          amountCurrency={10}
          categoryList={mockCategoryList}
        />
      );

      expect(screen.getByText(/da definire/)).toBeInTheDocument();
    });

    it("should render without crashing when all props are minimal", () => {
      const minimalCategory: Category = {
        id: 1,
        title: "Vitto",
        active: true,
        str: "vitto",
        parent: undefined,
      };

      vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
      vi.spyOn(useExpense, "useGetBudgetLimit").mockReturnValue({
        data: mockBudgetLimit,
      } as any);

      render(
        <LimitBudget
          category={minimalCategory}
          amountCurrency={0}
          categoryList={[]}
        />
      );

      expect(screen.getByText(/Budget residuo/)).toBeInTheDocument();
    });
  });
});
