import { useMutation, useQuery, useQueryClient } from "react-query";
import { AxiosError } from "axios";
import {
  convertCurrencyTo,
  getBudgetLimit,
  getCategories,
  getCurrencies,
  listExpenses,
  getTypeOfDocument,
  getTypeOfPayment,
  saveExpense,
} from "../restapi/expense";
import { ExpenseInterface } from "../restapi/types";

export function useGetConvertCurrencyTo(
  day: string,
  fromCur: string,
  amount: string,
  toCur: string
) {
  return useQuery("covert", () => convertCurrencyTo(day, fromCur, amount, toCur));
}

export function useGetCategories() {
  const categories = useQuery("categories", () => getCategories());
  return categories.data;
}

export function useGetCurrencies() {
  const categories = useQuery("currencies", () => getCurrencies());
  return categories.data;
}

export function useGetTypeOfPayment() {
  const currencies = useQuery("payment-type", () => getTypeOfPayment());
  return currencies.data;
}

export function useGetDocumentType() {
  const documentType = useQuery("document-type", () => getTypeOfDocument());
  return documentType.data;
}

/** A page of expenses for the given list parameters (see `toApiParams`). */
export function useExpenseList(params: Record<string, string | number>) {
  return useQuery(["expenses", "list", params], () => listExpenses(params), {
    keepPreviousData: true,
  });
}

export function useEditExpense() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof saveExpense>>,
    AxiosError,
    { id: number; params: ExpenseInterface }
  >((args) => saveExpense(args.id, args.params), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: "mission" });
    },
    onError: () => {},
  });
}

export function useGetBudgetLimit() {
  return useQuery(["budget", "limit"], () => getBudgetLimit());
}
