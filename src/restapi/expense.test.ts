import { vi, describe, it, expect, beforeEach } from "vitest";
import * as expenseApi from "./expense";
import { restapi } from "./restapi";
import {
  Category,
  Currency,
  ExpenseInterface,
  LimitBudget,
  Page,
  TypeOfDocument,
  TypeOfPayment,
} from "./types";

// Mock the restapi module
vi.mock("./restapi", () => ({
  restapi: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("expense API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("convertCurrencyTo", () => {
    it("should return hardcoded value of '10'", async () => {
      const result = await expenseApi.convertCurrencyTo(
        "2024-01-01",
        "USD",
        "100",
        "EUR"
      );

      expect(result).toBe("10");
    });

    it("should not call restapi", async () => {
      await expenseApi.convertCurrencyTo("2024-01-01", "USD", "100", "EUR");

      expect(restapi.get).not.toHaveBeenCalled();
    });
  });

  describe("getExpenses", () => {
    it("should fetch expenses list", async () => {
      const mockExpenses: Page<ExpenseInterface> = {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            amount: 100,
            category: { id: 1, title: "Food", active: true, str: "food" } as Category,
            documentType: { id: 1, title: "Receipt", active: true, default: false } as TypeOfDocument,
            paymentType: { id: 1, title: "Cash", active: true, str: "cash" } as TypeOfPayment,
          } as unknown as ExpenseInterface,
          {
            id: 2,
            amount: 200,
            category: { id: 2, title: "Travel", active: true, str: "travel" } as Category,
            documentType: { id: 2, title: "Invoice", active: true, default: false } as TypeOfDocument,
            paymentType: { id: 2, title: "Card", active: true, str: "card" } as TypeOfPayment,
          } as unknown as ExpenseInterface,
        ],
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockExpenses });

      const result = await expenseApi.getExpenses();

      expect(restapi.get).toHaveBeenCalledWith("missions/expense/");
      expect(result).toEqual(mockExpenses);
    });

    it("should handle empty expenses list", async () => {
      const mockEmptyPage: Page<ExpenseInterface> = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockEmptyPage });

      const result = await expenseApi.getExpenses();

      expect(result.results).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getExpense", () => {
    it("should fetch expense by id", async () => {
      const mockExpense: ExpenseInterface = {
        id: 1,
        amount: 100,
        category: { id: 1, title: "Food", active: true, str: "food" } as Category,
        documentType: { id: 1, title: "Receipt", active: true, default: false } as TypeOfDocument,
        paymentType: { id: 1, title: "Cash", active: true, str: "cash" } as TypeOfPayment,
      } as unknown as ExpenseInterface;

      vi.mocked(restapi.get).mockResolvedValue({ data: mockExpense });

      const result = await expenseApi.getExpense(1);

      expect(restapi.get).toHaveBeenCalledWith("missions/expense/1/");
      expect(result).toEqual(mockExpense);
    });

    it("should fetch expense with different id", async () => {
      const mockExpense: ExpenseInterface = {
        id: 99,
        amount: 500,
        category: { id: 3, title: "Other", active: true, str: "other" } as Category,
        documentType: { id: 3, title: "Bill", active: true, default: false } as TypeOfDocument,
        paymentType: { id: 3, title: "Credit", active: true, str: "credit" } as TypeOfPayment,
      } as unknown as ExpenseInterface;

      vi.mocked(restapi.get).mockResolvedValue({ data: mockExpense });

      const result = await expenseApi.getExpense(99);

      expect(restapi.get).toHaveBeenCalledWith("missions/expense/99/");
      expect(result.id).toBe(99);
    });
  });

  describe("getCategories", () => {
    it("should fetch categories list", async () => {
      const mockCategories: Page<Category> = {
        count: 3,
        next: null,
        previous: null,
        results: [
          { id: 1, title: "Food", active: true, str: "food" } as Category,
          { id: 2, title: "Travel", active: true, str: "travel" } as Category,
          { id: 3, title: "Other", active: true, str: "other" } as Category,
        ],
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockCategories });

      const result = await expenseApi.getCategories();

      expect(restapi.get).toHaveBeenCalledWith("missions/expense_category/");
      expect(result).toEqual(mockCategories);
      expect(result.results).toHaveLength(3);
    });

    it("should return correct endpoint for categories", async () => {
      vi.mocked(restapi.get).mockResolvedValue({
        data: { count: 0, next: null, previous: null, results: [] },
      });

      await expenseApi.getCategories();

      expect(restapi.get).toHaveBeenCalledWith("missions/expense_category/");
    });
  });

  describe("getCurrencies", () => {
    it("should fetch currencies list", async () => {
      const mockCurrencies: Page<Currency> = {
        count: 3,
        next: null,
        previous: null,
        results: [
          { iso3: "USD", title: "US Dollar", symbol: "$", fractionalUnit: "cent", base: 1, active: true } as Currency,
          { iso3: "EUR", title: "Euro", symbol: "€", fractionalUnit: "cent", base: 1, active: true } as Currency,
          { iso3: "GBP", title: "Pound Sterling", symbol: "£", fractionalUnit: "penny", base: 1, active: true } as Currency,
        ],
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockCurrencies });

      const result = await expenseApi.getCurrencies();

      expect(restapi.get).toHaveBeenCalledWith("currencies/currency/");
      expect(result).toEqual(mockCurrencies);
      expect(result.results).toHaveLength(3);
    });

    it("should return correct endpoint for currencies", async () => {
      vi.mocked(restapi.get).mockResolvedValue({
        data: { count: 0, next: null, previous: null, results: [] },
      });

      await expenseApi.getCurrencies();

      expect(restapi.get).toHaveBeenCalledWith("currencies/currency/");
    });
  });

  describe("getTypeOfPayment", () => {
    it("should fetch payment types list", async () => {
      const mockPaymentTypes: Page<TypeOfPayment> = {
        count: 2,
        next: null,
        previous: null,
        results: [
          { id: 1, title: "Cash", active: true, str: "cash" } as TypeOfPayment,
          { id: 2, title: "Card", active: true, str: "card" } as TypeOfPayment,
        ],
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockPaymentTypes });

      const result = await expenseApi.getTypeOfPayment();

      expect(restapi.get).toHaveBeenCalledWith("missions/payment_category/");
      expect(result).toEqual(mockPaymentTypes);
    });

    it("should return correct endpoint for payment types", async () => {
      vi.mocked(restapi.get).mockResolvedValue({
        data: { count: 0, next: null, previous: null, results: [] },
      });

      await expenseApi.getTypeOfPayment();

      expect(restapi.get).toHaveBeenCalledWith("missions/payment_category/");
    });
  });

  describe("getTypeOfDocument", () => {
    it("should fetch document types list", async () => {
      const mockDocumentTypes: Page<TypeOfDocument> = {
        count: 3,
        next: null,
        previous: null,
        results: [
          { id: 1, title: "Receipt", active: true, default: false } as TypeOfDocument,
          { id: 2, title: "Invoice", active: true, default: false } as TypeOfDocument,
          { id: 3, title: "Bill", active: true, default: false } as TypeOfDocument,
        ],
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockDocumentTypes });

      const result = await expenseApi.getTypeOfDocument();

      expect(restapi.get).toHaveBeenCalledWith("missions/document_type/");
      expect(result).toEqual(mockDocumentTypes);
    });

    it("should return correct endpoint for document types", async () => {
      vi.mocked(restapi.get).mockResolvedValue({
        data: { count: 0, next: null, previous: null, results: [] },
      });

      await expenseApi.getTypeOfDocument();

      expect(restapi.get).toHaveBeenCalledWith("missions/document_type/");
    });
  });

  describe("saveExpense", () => {
    const mockExpenseParams: ExpenseInterface = {
      id: 1,
      amount: 100,
      category: { id: 5, title: "Food", active: true, str: "food" } as Category,
      documentType: { id: 3, title: "Receipt", active: true, default: false } as TypeOfDocument,
      paymentType: { id: 2, title: "Cash", active: true, str: "cash" } as TypeOfPayment,
      description: "Lunch",
    } as unknown as ExpenseInterface;

    it("should create new expense when id is undefined", async () => {
      const mockResponse = { data: mockExpenseParams };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);

      await expenseApi.saveExpense(undefined as any, mockExpenseParams);

      expect(restapi.post).toHaveBeenCalledWith("missions/expense/", {
        ...mockExpenseParams,
        category: 5,
        documentType: 3,
        paymentType: 2,
      });
      expect(restapi.patch).not.toHaveBeenCalled();
    });

    it("should update existing expense when id is provided", async () => {
      const mockResponse = { data: mockExpenseParams };
      vi.mocked(restapi.patch).mockResolvedValue(mockResponse);

      await expenseApi.saveExpense(1, mockExpenseParams);

      expect(restapi.patch).toHaveBeenCalledWith("missions/expense/1/", {
        ...mockExpenseParams,
        category: 5,
        documentType: 3,
        paymentType: 2,
      });
      expect(restapi.post).not.toHaveBeenCalled();
    });

    it("should refactor params to use IDs instead of objects", async () => {
      const mockResponse = { data: mockExpenseParams };
      vi.mocked(restapi.patch).mockResolvedValue(mockResponse);

      await expenseApi.saveExpense(10, mockExpenseParams);

      const expectedParams = {
        ...mockExpenseParams,
        category: 5,
        documentType: 3,
        paymentType: 2,
      };

      expect(restapi.patch).toHaveBeenCalledWith(
        "missions/expense/10/",
        expectedParams
      );
    });

    it("should handle expense with different IDs", async () => {
      const differentExpense: ExpenseInterface = {
        id: 2,
        amount: 250,
        category: { id: 10, title: "Travel", active: true, str: "travel" } as Category,
        documentType: { id: 7, title: "Invoice", active: true, default: false } as TypeOfDocument,
        paymentType: { id: 4, title: "Card", active: true, str: "card" } as TypeOfPayment,
      } as unknown as ExpenseInterface;

      const mockResponse = { data: differentExpense };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);

      await expenseApi.saveExpense(undefined as any, differentExpense);

      expect(restapi.post).toHaveBeenCalledWith("missions/expense/", {
        ...differentExpense,
        category: 10,
        documentType: 7,
        paymentType: 4,
      });
    });

    it("should preserve other properties when refactoring", async () => {
      const expenseWithExtraProps: ExpenseInterface = {
        id: 1,
        amount: 100,
        category: { id: 5, title: "Food", active: true, str: "food" } as Category,
        documentType: { id: 3, title: "Receipt", active: true, default: false } as TypeOfDocument,
        paymentType: { id: 2, title: "Cash", active: true, str: "cash" } as TypeOfPayment,
        description: "Business lunch",
        date: "2024-01-15",
      } as unknown as ExpenseInterface;

      const mockResponse = { data: expenseWithExtraProps };
      vi.mocked(restapi.patch).mockResolvedValue(mockResponse);

      await expenseApi.saveExpense(5, expenseWithExtraProps);

      const callArgs = vi.mocked(restapi.patch).mock.calls[0][1];
      expect(callArgs).toHaveProperty("description", "Business lunch");
      expect(callArgs).toHaveProperty("date", "2024-01-15");
      expect(callArgs).toHaveProperty("category", 5);
      expect(callArgs).toHaveProperty("documentType", 3);
      expect(callArgs).toHaveProperty("paymentType", 2);
    });
  });

  describe("uploadImage", () => {
    it("should upload image for expense", async () => {
      const mockExpense: ExpenseInterface = {
        id: 1,
        amount: 100,
        category: { id: 1, title: "Food", active: true, str: "food" } as Category,
        documentType: { id: 1, title: "Receipt", active: true, default: false } as TypeOfDocument,
        paymentType: { id: 1, title: "Cash", active: true, str: "cash" } as TypeOfPayment,
        image: "base64imagedata",
      } as unknown as ExpenseInterface;

      const mockResponse = { data: mockExpense };
      vi.mocked(restapi.patch).mockResolvedValue(mockResponse);

      const result = await expenseApi.uploadImage(1, mockExpense);

      expect(restapi.patch).toHaveBeenCalledWith(
        "missions/expense/1/",
        mockExpense
      );
      expect(result).toEqual(mockResponse);
    });

    it("should upload image with different expense id", async () => {
      const mockExpense: ExpenseInterface = {
        id: 42,
        amount: 150,
        category: { id: 2, title: "Travel", active: true, str: "travel" } as Category,
        documentType: { id: 2, title: "Invoice", active: true, default: false } as TypeOfDocument,
        paymentType: { id: 2, title: "Card", active: true, str: "card" } as TypeOfPayment,
        image: "anotherimagadata",
      } as unknown as ExpenseInterface;

      const mockResponse = { data: mockExpense };
      vi.mocked(restapi.patch).mockResolvedValue(mockResponse);

      await expenseApi.uploadImage(42, mockExpense);

      expect(restapi.patch).toHaveBeenCalledWith(
        "missions/expense/42/",
        mockExpense
      );
    });

    it("should not refactor params like saveExpense does", async () => {
      const mockExpense: ExpenseInterface = {
        id: 1,
        amount: 100,
        category: { id: 5, title: "Food", active: true, str: "food" } as Category,
        documentType: { id: 3, title: "Receipt", active: true, default: false } as TypeOfDocument,
        paymentType: { id: 2, title: "Cash", active: true, str: "cash" } as TypeOfPayment,
      } as unknown as ExpenseInterface;

      const mockResponse = { data: mockExpense };
      vi.mocked(restapi.patch).mockResolvedValue(mockResponse);

      await expenseApi.uploadImage(1, mockExpense);

      // Verify that the entire object is passed, not refactored
      const callArgs = vi.mocked(restapi.patch).mock.calls[0][1] as ExpenseInterface;
      expect(callArgs.category).toEqual({ id: 5, title: "Food", active: true, str: "food" });
      expect(callArgs.documentType).toEqual({ id: 3, title: "Receipt", active: true, default: false });
      expect(callArgs.paymentType).toEqual({ id: 2, title: "Cash", active: true, str: "cash" });
    });
  });

  describe("getBudgetLimit", () => {
    it("should return hardcoded budget limits", async () => {
      const expectedLimits: LimitBudget = {
        vitto: 50,
        viaggi: 100,
        varie: 100,
      };

      const result = await expenseApi.getBudgetLimit();

      expect(result).toEqual(expectedLimits);
    });

    it("should not call restapi", async () => {
      await expenseApi.getBudgetLimit();

      expect(restapi.get).not.toHaveBeenCalled();
    });

    it("should return correct limit values", async () => {
      const result = await expenseApi.getBudgetLimit();

      expect(result.vitto).toBe(50);
      expect(result.viaggi).toBe(100);
      expect(result.varie).toBe(100);
    });
  });
});
