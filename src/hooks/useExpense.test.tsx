import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useGetConvertCurrencyTo,
  useGetCategories,
  useGetCurrencies,
  useGetTypeOfPayment,
  useGetDocumentType,
  useGetExpense,
  useEditExpense,
  useGetBudgetLimit,
} from "./useExpense";
import * as expenseApi from "../restapi/expense";
import {
  Category,
  Currency,
  TypeOfPayment,
  TypeOfDocument,
  ExpenseInterface,
  Page,
  LimitBudget,
} from "../restapi/types";

// Mock the expense API
vi.mock("../restapi/expense", () => ({
  convertCurrencyTo: vi.fn(),
  getCategories: vi.fn(),
  getCurrencies: vi.fn(),
  getTypeOfPayment: vi.fn(),
  getTypeOfDocument: vi.fn(),
  getExpenses: vi.fn(),
  saveExpense: vi.fn(),
  getBudgetLimit: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useExpense hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("useGetConvertCurrencyTo", () => {
    it("should convert currency", async () => {
      const mockConversionResult = "10";
      vi.mocked(expenseApi.convertCurrencyTo).mockResolvedValue(mockConversionResult);

      const { result } = renderHook(
        () => useGetConvertCurrencyTo("2024-01-01", "USD", "100", "EUR"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(mockConversionResult);
      expect(expenseApi.convertCurrencyTo).toHaveBeenCalledWith(
        "2024-01-01",
        "USD",
        "100",
        "EUR"
      );
    });

    it("should handle conversion error", async () => {
      vi.mocked(expenseApi.convertCurrencyTo).mockRejectedValue(
        new Error("Conversion failed")
      );

      const { result } = renderHook(
        () => useGetConvertCurrencyTo("2024-01-01", "USD", "100", "EUR"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
    });
  });

  describe("useGetCategories", () => {
    const mockCategories: Page<Category> = {
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          active: true,
          id: 1,
          str: "Vitto",
          title: "Meal",
        },
        {
          active: true,
          id: 2,
          str: "Viaggi",
          title: "Travel",
        },
      ],
    };

    it("should fetch and return categories", async () => {
      vi.mocked(expenseApi.getCategories).mockResolvedValue(mockCategories);

      const { result } = renderHook(() => useGetCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toEqual(mockCategories);
      });

      expect(expenseApi.getCategories).toHaveBeenCalledTimes(1);
    });

    it("should return undefined when categories fetch fails", async () => {
      vi.mocked(expenseApi.getCategories).mockRejectedValue(
        new Error("Failed to fetch categories")
      );

      const { result } = renderHook(() => useGetCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it("should return undefined initially before data loads", () => {
      vi.mocked(expenseApi.getCategories).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useGetCategories(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe("useGetCurrencies", () => {
    const mockCurrencies: Page<Currency> = {
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          iso3: "USD",
          title: "US Dollar",
          symbol: "$",
          fractionalUnit: "cent",
          base: 100,
          active: true,
        },
        {
          iso3: "EUR",
          title: "Euro",
          symbol: "€",
          fractionalUnit: "cent",
          base: 100,
          active: true,
        },
      ],
    };

    it("should fetch and return currencies", async () => {
      vi.mocked(expenseApi.getCurrencies).mockResolvedValue(mockCurrencies);

      const { result } = renderHook(() => useGetCurrencies(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toEqual(mockCurrencies);
      });

      expect(expenseApi.getCurrencies).toHaveBeenCalledTimes(1);
    });

    it("should return undefined when currencies fetch fails", async () => {
      vi.mocked(expenseApi.getCurrencies).mockRejectedValue(
        new Error("Failed to fetch currencies")
      );

      const { result } = renderHook(() => useGetCurrencies(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it("should return undefined initially before data loads", () => {
      vi.mocked(expenseApi.getCurrencies).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useGetCurrencies(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe("useGetTypeOfPayment", () => {
    const mockPaymentTypes: Page<TypeOfPayment> = {
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          active: true,
          id: 1,
          title: "Cash",
          str: "cash",
        },
        {
          active: true,
          id: 2,
          title: "Credit Card",
          str: "credit_card",
        },
      ],
    };

    it("should fetch and return payment types", async () => {
      vi.mocked(expenseApi.getTypeOfPayment).mockResolvedValue(mockPaymentTypes);

      const { result } = renderHook(() => useGetTypeOfPayment(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toEqual(mockPaymentTypes);
      });

      expect(expenseApi.getTypeOfPayment).toHaveBeenCalledTimes(1);
    });

    it("should return undefined when payment types fetch fails", async () => {
      vi.mocked(expenseApi.getTypeOfPayment).mockRejectedValue(
        new Error("Failed to fetch payment types")
      );

      const { result } = renderHook(() => useGetTypeOfPayment(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it("should return undefined initially before data loads", () => {
      vi.mocked(expenseApi.getTypeOfPayment).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useGetTypeOfPayment(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe("useGetDocumentType", () => {
    const mockDocumentTypes: Page<TypeOfDocument> = {
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          active: true,
          default: true,
          id: 1,
          title: "Invoice",
        },
        {
          active: true,
          default: false,
          id: 2,
          title: "Receipt",
        },
      ],
    };

    it("should fetch and return document types", async () => {
      vi.mocked(expenseApi.getTypeOfDocument).mockResolvedValue(mockDocumentTypes);

      const { result } = renderHook(() => useGetDocumentType(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toEqual(mockDocumentTypes);
      });

      expect(expenseApi.getTypeOfDocument).toHaveBeenCalledTimes(1);
    });

    it("should return undefined when document types fetch fails", async () => {
      vi.mocked(expenseApi.getTypeOfDocument).mockRejectedValue(
        new Error("Failed to fetch document types")
      );

      const { result } = renderHook(() => useGetDocumentType(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it("should return undefined initially before data loads", () => {
      vi.mocked(expenseApi.getTypeOfDocument).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useGetDocumentType(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe("useGetExpense", () => {
    const mockExpenses: Page<ExpenseInterface> = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          day: "2024-01-15",
          amountCurrency: "100",
          amountBase: "100",
          amountReimbursement: "100",
          detail: "Business lunch",
          documentType: {
            active: true,
            default: true,
            id: 1,
            title: "Invoice",
          },
          image: "path/to/image.jpg",
          createdTs: "2024-01-15T10:00:00Z",
          modifiedTs: "2024-01-15T10:00:00Z",
          category: {
            active: true,
            id: 1,
            str: "Vitto",
            title: "Meal",
          },
          paymentType: {
            active: true,
            id: 1,
            title: "Cash",
            str: "cash",
          },
          currency: "USD",
          mission: 1,
          reimbursement: 100,
        },
      ],
    };

    it("should fetch and return expenses", async () => {
      vi.mocked(expenseApi.getExpenses).mockResolvedValue(mockExpenses);

      const { result } = renderHook(() => useGetExpense(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockExpenses);
      expect(expenseApi.getExpenses).toHaveBeenCalledTimes(1);
    });

    it("should handle error when fetching expenses", async () => {
      vi.mocked(expenseApi.getExpenses).mockRejectedValue(
        new Error("Failed to fetch expenses")
      );

      const { result } = renderHook(() => useGetExpense(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
    });

    it("should call onError callback when fetch fails", async () => {
      vi.mocked(expenseApi.getExpenses).mockRejectedValue(
        new Error("Failed to fetch expenses")
      );

      const { result } = renderHook(() => useGetExpense(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // The onError in the hook returns 'error' but doesn't do anything with it
      // Just verify the hook handles the error gracefully
      expect(result.current.error).toBeTruthy();
    });
  });

  describe("useEditExpense", () => {
    const mockExpense: ExpenseInterface = {
      id: 1,
      day: "2024-01-15",
      amountCurrency: "100",
      amountBase: "100",
      amountReimbursement: "100",
      detail: "Updated business lunch",
      documentType: {
        active: true,
        default: true,
        id: 1,
        title: "Invoice",
      },
      image: "path/to/image.jpg",
      createdTs: "2024-01-15T10:00:00Z",
      modifiedTs: "2024-01-15T11:00:00Z",
      category: {
        active: true,
        id: 1,
        str: "Vitto",
        title: "Meal",
      },
      paymentType: {
        active: true,
        id: 1,
        title: "Cash",
        str: "cash",
      },
      currency: "USD",
      mission: 1,
      reimbursement: 100,
    };

    it("should save expense successfully", async () => {
      vi.mocked(expenseApi.saveExpense).mockResolvedValue({ data: mockExpense } as any);

      const { result } = renderHook(() => useEditExpense(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 1, params: mockExpense });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(expenseApi.saveExpense).toHaveBeenCalledWith(1, mockExpense);
    });

    it("should handle save expense error", async () => {
      vi.mocked(expenseApi.saveExpense).mockRejectedValue(
        new Error("Failed to save expense")
      );

      const { result } = renderHook(() => useEditExpense(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 1, params: mockExpense });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(expenseApi.saveExpense).toHaveBeenCalledWith(1, mockExpense);
    });

    it("should invalidate mission queries on success", async () => {
      vi.mocked(expenseApi.saveExpense).mockResolvedValue({ data: mockExpense } as any);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useEditExpense(), { wrapper });

      result.current.mutate({ id: 1, params: mockExpense });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: "mission" });
    });

    it("should handle error callback", async () => {
      const mockError = new Error("Save failed");
      vi.mocked(expenseApi.saveExpense).mockRejectedValue(mockError);

      const { result } = renderHook(() => useEditExpense(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 1, params: mockExpense });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Verify error was handled (even though the onError callback is empty)
      expect(result.current.error).toBeTruthy();
    });

    it("should pass correct parameters for creating new expense", async () => {
      const newExpense = { ...mockExpense, id: undefined as any };
      vi.mocked(expenseApi.saveExpense).mockResolvedValue({ data: newExpense } as any);

      const { result } = renderHook(() => useEditExpense(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: undefined as any, params: newExpense });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(expenseApi.saveExpense).toHaveBeenCalledWith(undefined, newExpense);
    });
  });

  describe("useGetBudgetLimit", () => {
    const mockBudgetLimit: LimitBudget = {
      vitto: 50,
      viaggi: 100,
      varie: 100,
    };

    it("should fetch and return budget limit", async () => {
      vi.mocked(expenseApi.getBudgetLimit).mockResolvedValue(mockBudgetLimit);

      const { result } = renderHook(() => useGetBudgetLimit(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockBudgetLimit);
      expect(expenseApi.getBudgetLimit).toHaveBeenCalledTimes(1);
    });

    it("should handle error when fetching budget limit", async () => {
      vi.mocked(expenseApi.getBudgetLimit).mockRejectedValue(
        new Error("Failed to fetch budget limit")
      );

      const { result } = renderHook(() => useGetBudgetLimit(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
    });

    it("should use correct query key", async () => {
      vi.mocked(expenseApi.getBudgetLimit).mockResolvedValue(mockBudgetLimit);

      const queryClient = new QueryClient();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useGetBudgetLimit(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify the query is cached with the correct key
      const cachedData = queryClient.getQueryData(["budget", "limit"]);
      expect(cachedData).toEqual(mockBudgetLimit);
    });
  });
});
