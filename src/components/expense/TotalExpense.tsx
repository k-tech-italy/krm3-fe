import { MissionInterface } from "../../restapi/types";

interface Props {
  mission: MissionInterface;
  /** Symbol of the base currency (BASE_CURRENCY) the totals are expressed in */
  currencySymbol: string;
}

export function TotalsExpense({ mission, currencySymbol }: Props) {
  // computed by the backend (Mission.expense_totals), in the base currency
  const totals = [
    { title: "Total Refund", value: mission.totals?.refund ?? "0.00" },
    { title: "Total Anticipated", value: mission.totals?.anticipated ?? "0.00" },
    { title: "Totals", value: mission.totals?.total ?? "0.00" },
  ];

  return (
    <div className="flex flex-row justify-around gap-6 mt-6">
      {totals.map((total, i) => (
        <div
          key={i}
          className="flex flex-col items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-lg p-6 w-1/3"
        >
          <h5 className="text-lg font-semibold text-gray-700">{total.title}</h5>
          <p className="text-2xl text-gray-900">
            {total.value} {currencySymbol}
          </p>
        </div>
      ))}
    </div>
  );
}
