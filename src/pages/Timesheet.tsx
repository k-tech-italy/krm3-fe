import { useState } from "react";
import Krm3Calendar from "../components/timesheet/Krm3Calendar";
import SelectResourceComponent from "../components/timesheet/SelectResource";
import Tabs from "../components/commons/TopTabs";
import TimesheetReport from "../components/timesheet/timesheet-report/TimesheetReport";

export default function Timesheet() {
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string>("timesheet");

  return (
    <div className="bg-white">
      <Tabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={[
          { label: "Timesheet", value: "timesheet" },
          { label: "Report", value: "report" },
        ]}
      />
      {activeTab === "timesheet" && (
        <div className="p-8">
          <SelectResourceComponent
            setSelectedResourceId={setSelectedResourceId}
          />
          <Krm3Calendar selectedResourceId={selectedResourceId} />
        </div>
      )}
      {activeTab === "report" && <TimesheetReport />}
    </div>
  );
}
