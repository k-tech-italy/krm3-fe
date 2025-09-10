import React, { useEffect, useState } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import { ExpenseError, ExpenseInterface } from "../../../restapi/types";
import {
  useGetCategories,
  useGetCurrencies,
  useGetDocumentType,
  useGetTypeOfPayment,
} from "../../../hooks/useExpense";
import { convertCurrencyTo } from "../../../restapi/expense";
import LimitBudget from "./LimitBudget";
import "react-datepicker/dist/react-datepicker.css";
import "../expense.css";

interface Props {
  expense: ExpenseInterface;
  error?: ExpenseError;
}

export function ExpenseEditForm(props: Props) {
  const [expenseEdit, setExpenseEdit] = useState<ExpenseInterface>(
    props.expense
  );
  const [error, setError] = useState<ExpenseError | undefined>(props.error);
  const [amountError, setAmountError] = useState(false);
  const [amountBase, setAmountBase] = useState("");
  const [progressBar, setProgressBar] = useState({ now: 0, max: 100 });
  const [showProgressBar, setShowProgressBar] = useState(false);

  const currencyList = useGetCurrencies();
  const typeOfPaymentList = useGetTypeOfPayment();
  const categoryList = useGetCategories();
  const typeOfDocumentList = useGetDocumentType();

  useEffect(() => {
    setExpenseEdit((prev) => props.expense);
  }, [props.expense]);

  useEffect(() => {
    setError((prev) => props.error);
  }, [props.error]);

  function handleCurrencyAmount(e: any) {
    //convert currency and check error refund < amount
    convertCurrencyTo(
      "2023-08-23",
      props.expense.currency,
      e.target.value,
      "EUR"
    )
      .then((res) => {
        setAmountBase((prev) => res);
        setAmountError(false);
      })
      .catch(() => setAmountError(true));

    props.expense.amountCurrency = e.target.value;
    props.expense.amountBase = amountBase;
    delete error?.amountCurrency;
    setExpenseEdit({ ...expenseEdit, amountCurrency: e.target.value });
    /*if (parseInt(e.target.value) > parseInt(props.expense?.amountReimbursement || '')) {
            setAmountError(true);
        } else {
            setAmountError(false);
        }*/
  }

  function handleSelectTypeOfPayment(e: any) {
    if (!!typeOfPaymentList) {
      const selected =
        typeOfPaymentList.results
          .filter((payment) => payment.id === Number(e.target.value))
          .at(0) || props.expense.paymentType;
      props.expense.paymentType = selected;
      delete error?.paymentType;
      setExpenseEdit({ ...expenseEdit, paymentType: selected });
    }
  }

  function handleSelectTypeOfDocument(e: any) {
    if (!!typeOfDocumentList) {
      const selected =
        typeOfDocumentList.results
          .filter((document) => document.id === Number(e.target.value))
          .at(0) || props.expense.documentType;
      props.expense.documentType = selected; // { id: selected.id } as TypeOfDocument
      delete error?.documentType;
      setExpenseEdit({ ...expenseEdit, documentType: selected });
    }
  }

  function handleSelectCategory(e: any) {
    if (!!categoryList) {
      const selected =
        categoryList.results
          .filter((category) => category.id === Number(e.target.value))
          .at(0) || props.expense.category;
      props.expense.category = selected;
      delete error?.category;
      setExpenseEdit({ ...expenseEdit, category: selected });
    }
  }

  function handleCurrency(e: any) {
    props.expense.currency = e.target.value;
    delete error?.currency;
    setExpenseEdit({ ...expenseEdit, currency: e.target.value });
    if (!!props.expense.amountCurrency) {
      convertCurrencyTo(
        "2023-08-23",
        e.target.value,
        props.expense.amountCurrency,
        "EUR"
      )
        .then((res) => {
          props.expense.amountBase = res;
          setAmountBase((prev) => res);
          setAmountError(false);
        })
        .catch(() => setAmountError(true));
    }
  }

  function handleUploadImage(e: any): void {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(e.target.files[0]);
    fileReader.onloadstart = (pe) => {
      setShowProgressBar(true);
    };
    fileReader.onprogress = (pe) => {
      if (pe.lengthComputable) {
        setProgressBar({ ...progressBar, now: pe.loaded, max: pe.total });
      }
    };
    fileReader.onloadend = (pe) => {
      console.log("DONE", fileReader.readyState);
      //setShowProgressBar(false)
      //setProgressBar({ ...progressBar, now: 0, max: pe.total })
      if (progressBar.now === pe.total) {
        setShowProgressBar(false);
      }
      props.expense.image = fileReader.result as string;
      setExpenseEdit({ ...expenseEdit, image: fileReader.result as string });
    };
  }

  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        <label className="font-semibold">Data spesa</label>
        <div className="sm:col-span-2">
          <DatePicker
            id="expense-edit-form-day-date-picker"
            selected={
              !!expenseEdit.day ? new Date(expenseEdit.day) : new Date()
            }
            className="w-full border border-gray-300 rounded-md p-2"
            onChange={(date: Date | null) => {
              setExpenseEdit({
                ...expenseEdit,
                day: moment(date).format("YYYY-MM-DD"),
              });
              props.expense.day = moment(date).format("YYYY-MM-DD");
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        <label className="font-semibold">Categoria</label>
        <div>
          <select
            className={`w-full border rounded-md p-2 ${
              !!error?.category ? "border-red-500" : "border-gray-300"
            }`}
            onChange={handleSelectCategory}
            value={expenseEdit.category?.id}
            data-testid="category-select"
          >
            {[
              { id: 0, title: "Scegli la categoria" },
              ...(categoryList?.results || []),
            ].map((category) => (
              <option key={category.id} value={category.id}>
                {category?.title}
              </option>
            ))}
          </select>
          {!!error?.category && (
            <div className="text-red-500 text-sm mt-1">{error.category}</div>
          )}
        </div>
        {!!categoryList && (
          <div className="text-center">
            <LimitBudget
              amountCurrency={Number(expenseEdit.amountCurrency)}
              category={expenseEdit.category}
              categoryList={categoryList?.results}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        <label className="font-semibold">Tipo Documento</label>
        <div className="sm:col-span-2">
          <select
            data-testid="document-type-select"
            className={`w-full border rounded-md p-2 ${
              !!error?.documentType ? "border-red-500" : "border-gray-300"
            }`}
            onChange={handleSelectTypeOfDocument}
            value={expenseEdit.documentType?.id || 0}
          >
            {[
              { id: 0, title: "Scegli un documento" },
              ...(typeOfDocumentList?.results || []),
            ].map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc?.title}
              </option>
            ))}
          </select>
          {!!error?.documentType && (
            <div className="text-red-500 text-sm mt-1">
              {error.documentType}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        <label className="font-semibold">Dettaglio</label>
        <div className="sm:col-span-2">
          <input
            data-testid="detail-input"
            className="w-full border border-gray-300 rounded-md p-2"
            onChange={(e) => {
              setExpenseEdit({ ...expenseEdit, detail: e.target.value });
              props.expense.detail = e.target.value;
            }}
            value={expenseEdit.detail || ""}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        <label className="font-semibold">Tipo di Pagamento</label>
        <div className="sm:col-span-2">
          <select
            data-testid="payment-type-select"
            className={`w-full border rounded-md p-2 ${
              !!error?.paymentType ? "border-red-500" : "border-gray-300"
            }`}
            onChange={handleSelectTypeOfPayment}
            value={expenseEdit.paymentType?.id}
          >
            {[
              { id: 0, title: "Scegli il tipo di pagamento" },
              ...(typeOfPaymentList?.results || []),
            ].map((c) => (
              <option key={c.id} value={c.id}>
                {c.title || ""}
              </option>
            ))}
          </select>
          {!!error?.paymentType && (
            <div className="text-red-500 text-sm mt-1">{error.paymentType}</div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        <label className="font-semibold">Importo</label>
        <div className="flex space-x-2">
          <input
            data-testid="currency-amount-input"
            type="number"
            step="0.01"
            min="0"
            className={`w-1/2 border rounded-md p-2 text-right ${
              !!error?.amountCurrency ? "border-red-500" : "border-gray-300"
            }`}
            onChange={handleCurrencyAmount}
            value={expenseEdit.amountCurrency || 0}
          />
          <select
            data-testid="currency-select"
            className={`w-1/2 border rounded-md p-2 ${
              !!error?.currency ? "border-red-500" : "border-gray-300"
            }`}
            onChange={handleCurrency}
            value={expenseEdit.currency}
          >
            {[{ id: 0, iso3: "scegli" }, ...(currencyList?.results || [])].map(
              (c) => (
                <option value={c.iso3} key={c.iso3}>
                  {c.iso3}
                </option>
              )
            )}
          </select>
        </div>
        {!!error?.currency && (
          <div className="text-red-500 text-sm mt-1">{error.currency}</div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        <label className="font-semibold">Importo in €</label>
        <div>
          <input
            disabled
            type="number"
            step="0.01"
            className="w-full border border-gray-300 rounded-md p-2 text-right"
            value={amountBase || 0}
          />
        </div>
        {amountError && (
          <div className="text-red-500 text-sm flex items-center">
            <i className="kt-icon-warning mr-2" />
            Massimale superato
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        <label className="font-semibold">Importo rimborso in €</label>
        <div>
          <input
            data-testid="amount-reimbursement-input"
            className="w-full border border-gray-300 rounded-md p-2 text-right"
            placeholder="Disabled input"
            onChange={(e) => {
              setExpenseEdit({
                ...expenseEdit,
                amountReimbursement: e.target.value,
              });
              props.expense.amountReimbursement = e.target.value;
            }}
            value={expenseEdit.amountReimbursement || 0}
          />
        </div>
        <label
          className={`font-semibold ${
            !!props.expense.amountReimbursement &&
            parseFloat(props.expense.amountReimbursement) < 1
              ? "text-red-500"
              : ""
          }`}
        >
          Azienda{" "}
          {!!props.expense.amountReimbursement
            ? expenseEdit.amountReimbursement
            : ""}{" "}
          €
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        <div className="sm:col-span-3 flex items-center space-x-2">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <label className="font-semibold">Approvazione</label>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        <label className="font-semibold mb-2 block" htmlFor="inputGroupFile04">
          Allegato
        </label>
        <div className="sm:col-span-2">
          <input
            data-testid="image-input"
            type="file"
            className="w-full border border-gray-300 rounded-md p-2"
            id="inputGroupFile04"
            onChange={handleUploadImage}
          />
        </div>
      </div>
    </form>
  );
}
