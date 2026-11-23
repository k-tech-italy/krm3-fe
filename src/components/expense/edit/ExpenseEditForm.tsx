import React, { useEffect, useState } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import Select, { SingleValue } from "react-select";
import { ExpenseError, ExpenseInterface } from "../../../restapi/types";
import {
  useGetCategories,
  useGetCurrencies,
  useGetDocumentType,
  useGetTypeOfPayment,
} from "../../../hooks/useExpense";
import { krm3SelectStyles } from "../../commons/selectStyles";
import "react-datepicker/dist/react-datepicker.css";
import "../expense.css";

interface Option {
  value: number;
  label: string;
}

interface Props {
  expense: ExpenseInterface;
  error?: ExpenseError;
}

export function ExpenseEditForm(props: Props) {
  const [expenseEdit, setExpenseEdit] = useState<ExpenseInterface>(props.expense);
  const [error, setError] = useState<ExpenseError | undefined>(props.error);
  const [progressBar, setProgressBar] = useState({ now: 0, max: 100 });
  const [, setShowProgressBar] = useState(false);

  const currencyList = useGetCurrencies();
  const typeOfPaymentList = useGetTypeOfPayment();
  const categoryList = useGetCategories();
  const typeOfDocumentList = useGetDocumentType();

  useEffect(() => {
    setExpenseEdit(props.expense);
  }, [props.expense]);

  useEffect(() => {
    setError(props.error);
  }, [props.error]);

  function handleCurrencyAmount(e: React.ChangeEvent<HTMLInputElement>) {
    // the amount in the base currency is computed by the backend
    props.expense.amountCurrency = e.target.value;
    delete error?.amountCurrency;
    setExpenseEdit({ ...expenseEdit, amountCurrency: e.target.value });
    /*if (parseInt(e.target.value) > parseInt(props.expense?.amountReimbursement || '')) {
            setAmountError(true);
        } else {
            setAmountError(false);
        }*/
  }

  function handleSelectTypeOfPayment(option: SingleValue<Option>) {
    const selected = typeOfPaymentList?.results.find((payment) => payment.id === option?.value);
    if (!selected) return;
    props.expense.paymentType = selected;
    delete error?.paymentType;
    setExpenseEdit({ ...expenseEdit, paymentType: selected });
  }

  function handleSelectTypeOfDocument(option: SingleValue<Option>) {
    const selected = typeOfDocumentList?.results.find((document) => document.id === option?.value);
    if (!selected) return;
    props.expense.documentType = selected;
    delete error?.documentType;
    setExpenseEdit({ ...expenseEdit, documentType: selected });
  }

  function handleSelectCategory(option: SingleValue<Option>) {
    const selected = categoryList?.results.find((category) => category.id === option?.value);
    if (!selected) return;
    props.expense.category = selected;
    delete error?.category;
    setExpenseEdit({ ...expenseEdit, category: selected });
  }

  function handleCurrency(e: React.ChangeEvent<HTMLSelectElement>) {
    props.expense.currency = e.target.value;
    delete error?.currency;
    setExpenseEdit({ ...expenseEdit, currency: e.target.value });
  }

  function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onloadstart = () => {
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

  const categoryOptions: Option[] = (categoryList?.results || []).map((c) => ({
    value: c.id,
    label: c.title,
  }));
  const documentTypeOptions: Option[] = (typeOfDocumentList?.results || []).map((d) => ({
    value: d.id,
    label: d.title,
  }));
  const paymentTypeOptions: Option[] = (typeOfPaymentList?.results || []).map((p) => ({
    value: p.id,
    label: p.title,
  }));

  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        <label className="font-semibold">Data spesa</label>
        <div className="sm:col-span-2">
          <DatePicker
            id="expense-edit-form-day-date-picker"
            selected={expenseEdit.day ? new Date(expenseEdit.day) : new Date()}
            className={`w-full border rounded-md p-2 ${
              error?.day ? "border-red-500" : "border-gray-300"
            }`}
            onChange={(date: Date | null) => {
              setExpenseEdit({
                ...expenseEdit,
                day: moment(date).format("YYYY-MM-DD"),
              });
              props.expense.day = moment(date).format("YYYY-MM-DD");
              delete error?.day;
            }}
          />
          {!!error?.day && <div className="text-red-500 text-sm mt-1">{error.day}</div>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        <label className="font-semibold">Categoria</label>
        <div className="sm:col-span-2">
          <div data-testid="category-select">
            <Select<Option>
              inputId="expense-edit-form-category"
              aria-label="Categoria"
              placeholder="Scegli la categoria"
              noOptionsMessage={() => "Nessuna categoria trovata"}
              isSearchable
              options={categoryOptions}
              value={categoryOptions.find((o) => o.value === expenseEdit.category?.id) ?? null}
              onChange={handleSelectCategory}
              styles={krm3SelectStyles<Option>(!!error?.category)}
            />
          </div>
          {!!error?.category && <div className="text-red-500 text-sm mt-1">{error.category}</div>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        <label className="font-semibold">Tipo Documento</label>
        <div className="sm:col-span-2">
          <div data-testid="document-type-select">
            <Select<Option>
              inputId="expense-edit-form-document-type"
              aria-label="Tipo Documento"
              placeholder="Scegli un documento"
              noOptionsMessage={() => "Nessun tipo documento trovato"}
              isSearchable
              options={documentTypeOptions}
              value={
                documentTypeOptions.find((o) => o.value === expenseEdit.documentType?.id) ?? null
              }
              onChange={handleSelectTypeOfDocument}
              styles={krm3SelectStyles<Option>(!!error?.documentType)}
            />
          </div>
          {!!error?.documentType && (
            <div className="text-red-500 text-sm mt-1">{error.documentType}</div>
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
          <div data-testid="payment-type-select">
            <Select<Option>
              inputId="expense-edit-form-payment-type"
              aria-label="Tipo di Pagamento"
              placeholder="Scegli il tipo di pagamento"
              noOptionsMessage={() => "Nessun tipo di pagamento trovato"}
              isSearchable
              options={paymentTypeOptions}
              value={
                paymentTypeOptions.find((o) => o.value === expenseEdit.paymentType?.id) ?? null
              }
              onChange={handleSelectTypeOfPayment}
              styles={krm3SelectStyles<Option>(!!error?.paymentType)}
            />
          </div>
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
              error?.amountCurrency ? "border-red-500" : "border-gray-300"
            }`}
            onChange={handleCurrencyAmount}
            value={expenseEdit.amountCurrency || 0}
          />
          <select
            data-testid="currency-select"
            className={`w-1/2 border rounded-md p-2 ${
              error?.currency ? "border-red-500" : "border-gray-300"
            }`}
            onChange={handleCurrency}
            value={expenseEdit.currency}
          >
            {[{ id: 0, iso3: "scegli" }, ...(currencyList?.results || [])].map((c) => (
              <option value={c.iso3} key={c.iso3}>
                {c.iso3}
              </option>
            ))}
          </select>
        </div>
        {!!error?.currency && <div className="text-red-500 text-sm mt-1">{error.currency}</div>}
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
            !!props.expense.amountReimbursement && parseFloat(props.expense.amountReimbursement) < 1
              ? "text-red-500"
              : ""
          }`}
        >
          Azienda {props.expense.amountReimbursement ? expenseEdit.amountReimbursement : ""} €
        </label>
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
