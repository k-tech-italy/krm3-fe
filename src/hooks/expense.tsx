import { useMutation, useQuery, useQueryClient } from "react-query";
import { AxiosError } from "axios";
import {
    convertCurrencyTo, getBudgetLimit,
    getCategories,
    getCurrencies,
    getExpenses,
    getTypeOfDocument,
    getTypeOfPayment,
    saveExpense
} from "../restapi/expense";
import { ExpenseInterface } from "../restapi/types";

export function useGetConvertCurrencyTo(day: string, fromCur: string, amount: string, toCur: string) {
    return useQuery('covert', () => convertCurrencyTo(day, fromCur, amount, toCur));
}

export function useGetCategories() {
    const categories = useQuery('categories', () => getCategories());
    return categories.data;
}

export function useGetCurrencies() {
    const categories = useQuery('currencies', () => getCurrencies());
    return categories.data;
}

export function useGetTypeOfPayment() {
    const currencies = useQuery('payment-type', () => getTypeOfPayment());
    return currencies.data;
}


export function useGetDocumentType() {
    const documentType = useQuery('document-type', () => getTypeOfDocument());
    return documentType.data;
}


export function useGetExpense() {
    const expenses = useQuery('expenses', () => getExpenses());
    return expenses.data;
}

export function useEditExpense() {
    const queryClient = useQueryClient();
    return useMutation((args: { id: number, params: ExpenseInterface }) => saveExpense(args.id, args.params),
        {
            onSuccess: (_, id) => {
                queryClient.invalidateQueries({ queryKey: 'mission' });
            },
            onError: (error: AxiosError) => {
            },
        });
}

export function useGetBudgetLimit() {
    return useQuery(['budget', 'limit'], () => getBudgetLimit())
}

