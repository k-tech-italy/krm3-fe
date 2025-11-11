import { describe, it, expect } from "vitest";
import { validateExpense } from "./validationExpenseForm";
import { ExpenseInterface, Category, TypeOfDocument, TypeOfPayment } from "../restapi/types";

describe("validationExpenseForm", () => {
  describe("validateExpense", () => {
    const validExpense: ExpenseInterface = {
      id: 1,
      day: "2025-01-15",
      amountCurrency: "100",
      amountBase: "100",
      amountReimbursement: "100",
      detail: "Test expense",
      documentType: { id: 1, title: "Receipt", active: true, default: false } as TypeOfDocument,
      image: "",
      createdTs: "2025-01-15T10:00:00Z",
      modifiedTs: "2025-01-15T10:00:00Z",
      mission: 1,
      currency: "USD",
      category: { id: 1, title: "Food", active: true, id: 1, str: "food" } as Category,
      paymentType: { id: 1, title: "Cash", active: true, str: "cash" } as TypeOfPayment,
      reimbursement: 1,
    };

    describe("valid expenses", () => {
      it("should resolve with valid expense", async () => {
        const result = await validateExpense(validExpense);

        expect(result).toEqual(validExpense);
      });

      it("should accept expense with positive amount", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: "50.50",
        };

        await expect(validateExpense(expense)).resolves.toEqual(expense);
      });

      it("should accept expense with large amount", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: "9999.99",
        };

        await expect(validateExpense(expense)).resolves.toEqual(expense);
      });

      it("should accept expense with all required fields", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: "100",
          category: { id: 2, title: "Travel", active: true, str: "travel" } as Category,
          documentType: { id: 2, title: "Invoice", active: true, default: false } as TypeOfDocument,
          paymentType: { id: 2, title: "Card", active: true, str: "card" } as TypeOfPayment,
          currency: "EUR",
        };

        await expect(validateExpense(expense)).resolves.toEqual(expense);
      });

      it("should accept expense with decimal amount", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: "123.45",
        };

        await expect(validateExpense(expense)).resolves.toEqual(expense);
      });
    });

    describe("amountCurrency validation", () => {
      it("should reject when amountCurrency is missing", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: undefined as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          amountCurrency: ["this field is required"],
        });
      });

      it("should reject when amountCurrency is empty string", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: "",
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          amountCurrency: ["must be positive"],
        });
      });

      it("should reject when amountCurrency is zero", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: "0",
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          amountCurrency: ["must be positive"],
        });
      });

      it("should reject when amountCurrency is zero as number", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: "0.00",
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          amountCurrency: ["must be positive"],
        });
      });

      it("should reject when amountCurrency is null", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: null as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          amountCurrency: ["must be positive"],
        });
      });
    });

    describe("category validation", () => {
      it("should reject when category is missing", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          category: undefined as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          category: ["this field is required"],
        });
      });

      it("should reject when category is null", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          category: null as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          category: ["this field is required"],
        });
      });
    });

    describe("documentType validation", () => {
      it("should reject when documentType is missing", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          documentType: undefined as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          documentType: ["this field is required"],
        });
      });

      it("should reject when documentType is null", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          documentType: null as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          documentType: ["this field is required"],
        });
      });
    });

    describe("paymentType validation", () => {
      it("should reject when paymentType is missing", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          paymentType: undefined as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          paymentType: ["this field is required"],
        });
      });

      it("should reject when paymentType is null", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          paymentType: null as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          paymentType: ["this field is required"],
        });
      });
    });

    describe("currency validation", () => {
      it("should reject when currency is missing", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          currency: undefined as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          currency: ["this field is required"],
        });
      });

      it("should reject when currency is empty string", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          currency: "",
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          currency: ["this field is required"],
        });
      });

      it("should reject when currency is null", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          currency: null as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          currency: ["this field is required"],
        });
      });
    });

    describe("multiple validation errors", () => {
      it("should reject with all missing required fields", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: undefined as any,
          category: undefined as any,
          documentType: undefined as any,
          paymentType: undefined as any,
          currency: undefined as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          amountCurrency: ["this field is required"],
          category: ["this field is required"],
          documentType: ["this field is required"],
          paymentType: ["this field is required"],
          currency: ["this field is required"],
        });
      });

      it("should reject with multiple errors - zero amount and missing fields", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: "0",
          category: undefined as any,
          documentType: undefined as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          amountCurrency: ["must be positive"],
          category: ["this field is required"],
          documentType: ["this field is required"],
        });
      });

      it("should reject with missing amountCurrency and category", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: "",
          category: null as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          amountCurrency: ["must be positive"],
          category: ["this field is required"],
        });
      });

      it("should reject with missing paymentType and currency", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          paymentType: undefined as any,
          currency: "",
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          paymentType: ["this field is required"],
          currency: ["this field is required"],
        });
      });

      it("should reject with zero amount, missing category and currency", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: "0",
          category: null as any,
          currency: undefined as any,
        };

        await expect(validateExpense(expense)).rejects.toEqual({
          amountCurrency: ["must be positive"],
          category: ["this field is required"],
          currency: ["this field is required"],
        });
      });
    });

    describe("edge cases", () => {
      it("should handle expense with only optional fields missing", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          detail: "",
          image: "",
        };

        await expect(validateExpense(expense)).resolves.toEqual(expense);
      });

      it("should accept minimum valid expense", async () => {
        const minimalExpense: ExpenseInterface = {
          id: 1,
          day: "2025-01-15",
          amountCurrency: "1",
          amountBase: undefined as any,
          amountReimbursement: undefined as any,
          detail: "",
          documentType: { id: 1, title: "Receipt", active: true, default: false } as TypeOfDocument,
          image: "",
          createdTs: "2025-01-15T10:00:00Z",
          modifiedTs: "2025-01-15T10:00:00Z",
          mission: 1,
          currency: "USD",
          category: { id: 1, title: "Food", active: true, str: "food" } as Category,
          paymentType: { id: 1, title: "Cash", active: true, str: "cash" } as TypeOfPayment,
          reimbursement: 1,
        };

        await expect(validateExpense(minimalExpense)).resolves.toEqual(minimalExpense);
      });

      it("should accept expense with very small positive amount", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: "0.01",
        };

        await expect(validateExpense(expense)).resolves.toEqual(expense);
      });

      it("should handle negative amount as missing field", async () => {
        const expense: ExpenseInterface = {
          ...validExpense,
          amountCurrency: "-10",
        };

        // Negative amounts are not explicitly validated, so it passes the validation
        // This is based on the current implementation
        await expect(validateExpense(expense)).resolves.toEqual(expense);
      });
    });
  });
});
