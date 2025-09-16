import {fireEvent, render, screen} from "@testing-library/react";
import {ExpenseEditForm} from "./ExpenseEditForm.tsx";
import {vi} from "vitest"
import * as useExpense from "../../../hooks/useExpense.tsx";

vi.mock("./LimitBudget", () => {
    return {
        default: () => <div>Mocked LimitBudget</div>
    }
})

describe('ExpenseEditForm', () => {
    const expense = {
        active: false,
            id: 456,
            currency: "PLN",
            title: "Second example title",
            amountCurrency: "201",
            amountReimbursement: "202",
            day: "2025-02-10",
            amountBase: "203",
            detail: "different details",
            image: "another/image/path",
            createdTs: "2025-02-01",
            modifiedTs: "2025-02-03",
            mission: 2,
            documentType: {
            active: true,
        default: false,
                id: 2,
                title: "doc_type_2",
        },
        category: {
            active: true,
                id: 1,
                str: "Lodging",
                title: "Lodging",
        },
        paymentType: {
            active: true,
                id: 1,
                title: "another payment type",
                str: "another payment type",
        } as const,
        reimbursement: 50,
    }
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(useExpense, "useEditExpense").mockImplementation(() => ({
            mutate:vi.fn(),
            isLoading: false,
            isError: false,
            error: null,
        }) as any);
        vi.spyOn(useExpense, "useGetCategories").mockReturnValue({
            results: [{id: 1, title: 'Lodging'}, {id: 2, title: 'Travel'}],
        } as any)
        vi.spyOn(useExpense, "useGetCurrencies").mockReturnValue({
            results: [{id: 1, iso3: 'PLN'}, {id: 2, iso3: 'EURO'}],
        } as any)
        vi.spyOn(useExpense, "useGetTypeOfPayment").mockReturnValue({
            results: [{id: 1, title: 'card'}, {id: 2, title: 'cash'}],
        } as any)
        vi.spyOn(useExpense, "useGetDocumentType").mockReturnValue({
            results: [{id: 1, title: 'doc_type_1'}, {id: 2, title: 'doc_type_2'}, {id: 3, title: 'doc_type_3'}],
        } as any)
    })
    it('renders errors', () => {
        const errors = {
            amountCurrency: "amountCurrencyError",
            paymentType: "paymentTypeError",
            documentType: "documentTypeError",
            category: "categoryError",
            currency: "currencyError",
        }
        render(<ExpenseEditForm expense={expense} error={errors as any}/>)
        expect(screen.getByText("documentTypeError")).toBeInTheDocument()
        expect(screen.getByText("paymentTypeError")).toBeInTheDocument()
        expect(screen.getByText("currencyError")).toBeInTheDocument()
        expect(screen.getByText("categoryError")).toBeInTheDocument()
    })
    it('resets errors', () => {
        const errors = {
            amountCurrency: "amountCurrencyError",
            paymentType: "paymentTypeError",
            documentType: "documentTypeError",
            category: "categoryError",
            currency: "currencyError",
        }
        render(<ExpenseEditForm expense={expense} error={errors as any}/>)
        fireEvent.change(screen.getByTestId("currency-select"), { target: { value: "EURO" }})
        fireEvent.change(screen.getByTestId("category-select"), { target: { value: "2" }})
        fireEvent.change(screen.getByTestId("document-type-select"), { target: { value: "3" }})
        fireEvent.change(screen.getByTestId("payment-type-select"), { target: { value: "2" }})
        fireEvent.input(screen.getByTestId("currency-amount-input"), { target: { value: "222" }})
        expect(screen.queryByText("documentTypeError")).not.toBeInTheDocument()
        expect(screen.queryByText("paymentTypeError")).not.toBeInTheDocument()
        expect(screen.queryByText("currencyError")).not.toBeInTheDocument()
        expect(screen.queryByText("categoryError")).not.toBeInTheDocument()
    })
})