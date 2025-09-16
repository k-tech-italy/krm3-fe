import {vi} from "vitest"
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {ExpenseEdit} from "./ExpenseEdit.tsx";
import * as useExpense from "../../../hooks/useExpense";

vi.mock("./LimitBudget", () => {
    return {
        default: () => <div>Mocked LimitBudget</div>
    }
})

describe('ExpenseEdit', () => {
    const onCloseMock = vi.fn()
    const props = {
        show: true,
        onClose: onCloseMock,
        expense: {
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
    }
    const mockedMutate = vi.fn((_variables, options?: {onSuccess?: () => void}) => {
        if(options && options.onSuccess)
        {
            options.onSuccess()
        }
    })
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(useExpense, "useEditExpense").mockImplementation(() => ({
            mutate: mockedMutate,
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
    it("renders correctly", () => {
        render(<ExpenseEdit {...props}/>);
        expect(screen.getByText("Close")).toBeInTheDocument();
        expect(screen.getByText("Save")).toBeInTheDocument();
        expect(screen.getByText("Mocked LimitBudget")).toBeInTheDocument()
        expect(screen.getByText("Data spesa")).toBeInTheDocument()
        expect(screen.getByText("Tipo Documento")).toBeInTheDocument()
        expect(screen.getByText("Importo")).toBeInTheDocument()
    })
    it("onClose function should be called", () => {
        render(<ExpenseEdit {...props}/>);
        fireEvent.click(screen.getByTestId("close-button"))
        expect(onCloseMock).toBeCalled()
    })
    it("loading screen should be displayed", () => {
        vi.spyOn(useExpense, "useEditExpense").mockImplementation(() => ({
                mutate: mockedMutate,
                isLoading: true,
                isError: false,
                error: null,
        }) as any);
        render(<ExpenseEdit {...props}/>);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    })
    it("does not render when !show", () => {
        render(<ExpenseEdit {...props} show={false}/>);
        expect(screen.queryByText("Close")).not.toBeInTheDocument();
        expect(screen.queryByText("Save")).not.toBeInTheDocument();
    })
    it("edit data and save", async () => {
        render(<ExpenseEdit {...props}/>);
        const image = new File(["some/path"], "filename.png", { type: "image/png" });
        fireEvent.change(screen.getByTestId("currency-select"), { target: { value: "EURO" }})
        fireEvent.change(screen.getByTestId("category-select"), { target: { value: "2" }})
        fireEvent.change(screen.getByTestId("document-type-select"), { target: { value: "3" }})
        fireEvent.change(screen.getByTestId("payment-type-select"), { target: { value: "2" }})
        fireEvent.input(screen.getByTestId("currency-amount-input"), { target: { value: "222" }})
        fireEvent.input(screen.getByTestId("detail-input"), { target: { value: "some details" }})
        fireEvent.input(screen.getByTestId("amount-reimbursement-input"), { target: { value: "525" }})
        fireEvent.change(screen.getByTestId("image-input"), { target: { files: [image] }})
        fireEvent.change(document.getElementById("expense-edit-form-day-date-picker") as HTMLElement, { target: { value: "2025-02-02" }})
        fireEvent.click(screen.getByTestId("save-button"))
        await waitFor(() => {
            expect(mockedMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 456,
                    params: expect.objectContaining({
                        category: expect.objectContaining({
                            id: 2,
                            title: "Travel",
                        }),
                        day: "2025-02-02",
                        amountCurrency: "222",
                        amountReimbursement: "525",
                        currency: "EURO",
                        detail: "some details",
                        image: "data:image/png;base64,c29tZS9wYXRo",
                        documentType: expect.objectContaining({
                            id: 3,
                            title: "doc_type_3"
                        }),
                        paymentType: expect.objectContaining({
                            id: 2,
                            title: "cash"
                        })
                    }),
                }),
                expect.objectContaining({
                    onSuccess: expect.any(Function),
                })
            );
            expect(onCloseMock).toBeCalled()
        })
    })
})