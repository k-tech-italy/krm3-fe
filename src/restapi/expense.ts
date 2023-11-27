import {
    Category,
    Currency,
    ExpenseInterface,
    LimitBudget,
    MissionInterface,
    Page,
    TypeOfDocument,
    TypeOfPayment
} from "./types";
import {restapi} from "./restapi";

export function getMissions(): Promise<Page<MissionInterface>> {
    return restapi.get<Page<MissionInterface>>(`missions/mission/`).then(res => res.data);
}

export function getMission(id: number): Promise<MissionInterface> {
    return restapi.get<MissionInterface>(`missions/mission/${id}/`).then(res => res.data);
}


export function getExpenses() {
    return restapi.get<Page<ExpenseInterface>>(`missions/expense/`).then(res => res.data);
}

export function getExpense(id: number) {
    return restapi.get<ExpenseInterface>(`missions/expense/${id}/`).then(res => res.data);
}

export function getCategories() {
    return restapi.get<Page<Category>>(`missions/expense_category/`).then(res => res.data);
}

export function getCurrencies() {
    return restapi.get<Page<Currency>>(`currencies/currency/`).then(res => res.data);
}

export function getTypeOfPayment() {
    return restapi.get<Page<TypeOfPayment>>(`missions/payment_category/`).then(res => res.data);
}

export function getTypeOfDocument() {
    return restapi.get<Page<TypeOfDocument>>(`missions/document_type/`).then(res => res.data);
}

export function saveExpense(id: number, params: ExpenseInterface) {
    const paramsRefactored = {...params, category: params.category.id, document_type: params.document_type.id, payment_type: params.payment_type.id}
    if (id === undefined) {
        return restapi.post<ExpenseInterface>('missions/expense/', paramsRefactored);
    }
    return restapi.patch<ExpenseInterface>(`missions/expense/${id}/`, paramsRefactored);
}

export function convertCurrencyTo(day: string, fromCur: string, amount: string, toCur: string):  Promise<string> {
     return Promise.resolve('10')
    //return restapi.get(`rate/${day}/convert/${fromCur}/${amount}/${toCur}/`).then(res => res.data);
}

export function getBudgetLimit() {
    return Promise.resolve<LimitBudget>(
        {
            vitto: 50,
            viaggi: 100,
        }
    )
}
