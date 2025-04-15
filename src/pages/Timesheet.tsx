import Krm3Calendar from "../components/timesheet/Krm3Calendar";

export default function Timesheet() {

    return (
        <div className="p-8 shadow rounded bg-white">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Timesheet</h2>
            </div>
            <div className="overflow-x-auto">
                <Krm3Calendar />
            </div>
        </div>
    );
}