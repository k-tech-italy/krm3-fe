import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetTimesheetReport } from "../../../hooks/useTimesheet";
import LoadSpinner from "../../commons/LoadSpinner";
import ReportTable from "./ReportTable";
import { useState } from "react";

function TimesheetReport() {
  // Use state for the current month/year
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(() => {
    // Set to first day of current month
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Format date as 'YYYYMM'
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const date = `${year}${month}`;

  const { data, isLoading } = useGetTimesheetReport(date);

  // Handlers for prev/next month
  const goToPrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  return (
    <div className="px-8">
      <div className="flex justify-between mb-5">
        <div
          className="flex  items-center justify-between min-w-[180px]"
          id="calendar-navigation"
        >
          <button
            id="nav-prev-btn"
            onClick={goToPrevMonth}
            className="cursor-pointer"
          >
            <ChevronLeft />
          </button>
          <span className="font-medium" id="date-range-display">
            {data?.title}
          </span>
          <button
            onClick={goToNextMonth}
            className="cursor-pointer"
            id="nav-next-btn"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
      {isLoading && <LoadSpinner />}
      {!!data ? (
        <ReportTable
          title={data.title}
          days={data.days}
          data={data.data}
          resource={data.keymap}
        />
      ) : (
        <>no data</>
      )}
    </div>
  );
}

export default TimesheetReport;
