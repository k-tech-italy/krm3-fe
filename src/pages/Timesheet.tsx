import { useState } from "react";
import Krm3Calendar from "../components/timesheet/Krm3Calendar";
import SelectResourceComponent from "../components/timesheet/SelectResource";

export default function Timesheet() {
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);

  return (
    <div className="p-8">
      <SelectResourceComponent setSelectedResourceId={setSelectedResourceId} />
      <Krm3Calendar selectedResourceId={selectedResourceId} />
    </div>
  );
}
