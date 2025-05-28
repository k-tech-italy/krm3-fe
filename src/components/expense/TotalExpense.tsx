import { MissionInterface } from '../../restapi/types';

interface Props {
    mission: MissionInterface;
}

export function TotalsExpense({ mission }: Props) {
    const totalRefund = 100

    const totalAnticipated = 200
    const totals = [
        { title: 'Total Refund', value: totalRefund },
        { title: 'Total Anticipated', value: totalAnticipated },
        { title: 'Totals', value: totalRefund + totalAnticipated }
    ]

    return (
        <div className="flex flex-row justify-around gap-6 mt-6">
            {totals.map((total, i) => (
                <div key={i} className="flex flex-col items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-lg p-6 w-1/3">
                    <h5 className="text-lg font-semibold text-gray-700">{total.title}</h5>
                    <p className="text-2xl text-gray-900">${total.value}</p>
                </div>
            ))}
        </div>
    );
}

