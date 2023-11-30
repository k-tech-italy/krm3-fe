import moment from "moment";
import { ExpenseError, ExpenseInterface } from "../restapi/types";


export function validateExpense(expense: ExpenseInterface): Promise<ExpenseInterface> {
    const error = {} as ExpenseError;

    if (!expense.amountCurrency) {
        error.amountCurrency =  ['this field is required'];
    }    
    if (Number(expense.amountCurrency) === 0) {
        error.amountCurrency =  ['must be positive'];
    }
    if (!expense.category) {
        error.category =  ['this field is required'];
    }
    if (!expense.documentType) {
        error.documentType =  ['this field is required'];
    }
    if (!expense.paymentType) {
        error.paymentType =  ['this field is required'];
    }
    if (!expense.currency) {
        error.currency =  ['this field is required'];
    }
   
    const isValid = Object.values(error).every(f => !f);
    return isValid ? Promise.resolve(expense) : Promise.reject(error);
}
