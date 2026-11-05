import { useState } from "react";
import Krm3Calendar from "../components/timesheet/Krm3Calendar";
import SelectResourceComponent from "../components/timesheet/SelectResource";

export default function Timesheet() {
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);
  const [period, setPeriod] = useState<{ from: string; to: string } | undefined>(undefined);

  return (
    <div className="p-8">
      <SelectResourceComponent setSelectedResourceId={setSelectedResourceId} period={period} />
      <Krm3Calendar selectedResourceId={selectedResourceId} onPeriodChange={setPeriod} />
    </div>
  );
}
