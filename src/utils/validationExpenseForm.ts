import moment from "moment";
import { ExpenseError, ExpenseInterface } from "../restapi/types";


export function validateExpense(expense: ExpenseInterface): Promise<ExpenseInterface> {
    const error = {} as ExpenseError;

    if (!expense.amount_currency) {
        error.amount_currency =  ['this field is required'];
    }
    if (!expense.category) {
        error.category =  ['this field is required'];
    }
    if (!expense.document_type) {
        error.document_type =  ['this field is required'];
    }
    if (!expense.payment_type) {
        error.payment_type =  ['this field is required'];
    }
    if (!expense.currency) {
        error.currency =  ['this field is required'];
    }
   
    const isValid = Object.values(error).every(f => !f);
    return isValid ? Promise.resolve(expense) : Promise.reject(error);
}
