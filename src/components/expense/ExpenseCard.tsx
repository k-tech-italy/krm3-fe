import React, { useEffect, useState } from 'react';
import { ExpenseInterface } from "../../restapi/types";
import { convertCurrencyTo } from "../../restapi/expense";
import "./expense.css";

interface Props {
  expense: ExpenseInterface,
  ShowIdCard: () => void,
}

export function ExpenseCard(props: Props) {
  const [amountBase, setAmountBase] = useState('');

  useEffect(() => {
    convertCurrencyTo('2023-08-23', props.expense.currency, props.expense.amountCurrency || '0', 'EUR').then(res => setAmountBase(prev => res))
  }, [props.expense])

  return (
    <div
      onClick={props.ShowIdCard}
      className={`cursor-pointer bg-white shadow-md rounded-lg ${
        !!props.expense.amountReimbursement && parseFloat(props.expense.amountReimbursement) < 1 ? 'border border-red-500' : ''
      }`}
    >
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <p className="m-0 p-1 text-sm">{props.expense.day}</p>
          <p className="m-0 p-1 text-sm">id: {props.expense.id}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <div className="text-left">
            <p className="text-gray-500 text-sm">Categoria</p>
            <h5 className="mb-3 text-lg font-semibold">{props.expense.category.title}</h5>
          </div>
        </div>
        <div className="flex">
          <div className="w-7/12 text-left">
            <p className="m-0 p-1 text-sm">Importo {props.expense.currency} {props.expense.amountCurrency}</p>
            <p className="m-0 p-1 text-sm">Importo EUR {amountBase}</p>
          </div>
          <div className="w-5/12 flex justify-end items-center">
            <i className="icon kt-icon-attach" />
          </div>
        </div>
      </div>
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <i className="fas fa-redo mr-1"></i>
          PAID
        </div>
      </div>
    </div>
  );
}
