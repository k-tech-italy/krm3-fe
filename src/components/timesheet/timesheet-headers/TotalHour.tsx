import { DoorOpen, Info } from "lucide-react";
import { DayEntry, TaskEntry } from "../../../restapi/types";
import { normalizeDate } from "../utils/dates";

interface Props {
  day: Date;
  dayEntry?: DayEntry;
  isMonthView?: boolean;
  colorClassName?: string;
}

export function calculateDayEntryTotal(dayEntry?: DayEntry): number {
  if (!dayEntry) return 0;

  return (
    (Number(dayEntry.dayHours) || 0) +
    (Number(dayEntry.nightHours) || 0) +
    (Number(dayEntry.leaveHours) || 0) +
    (Number(dayEntry.specialLeaveHours) || 0) +
    (Number(dayEntry.restHours) || 0) +
    (Number(dayEntry.travelHours) || 0) -
    (Number(dayEntry.bank) || 0)
  );
}

export function TotalHourCell({ day, dayEntry, isMonthView, colorClassName }: Readonly<Props>) {
  const formattedDay = normalizeDate(day);
  const totalHours = calculateDayEntryTotal(dayEntry);
  const tooltipId = `tooltip-hours-${formattedDay}`;
  const hasLeave = Number(dayEntry?.leaveHours) > 0 || Number(dayEntry?.specialLeaveHours) > 0;

  return (
    <div className="relative flex justify-center items-center h-full w-full">
      <div
        data-tooltip-id={tooltipId}
        data-tooltip-hidden={totalHours === 0}
        className={`items-center font-semibold ${
          isMonthView ? "text-sm" : "text-md"
        } flex justify-center  h-full w-full 
          ${colorClassName ?? ""}
        `}
      >
        {totalHours}h
        {totalHours > 0 && !isMonthView && (
          <Info size={18} color="gray" className="cursor-pointer mx-2" />
        )}
        {hasLeave && (
          <DoorOpen data-testid={`leave-icon-${formattedDay}`} size={isMonthView ? 14 : 20} />
        )}
      </div>
    </div>
  );
}

interface HoursDetailProps {
  title: string;
  hours: Array<{ label: string; value: number | string | undefined }>;
}

function HoursDetail({ title, hours }: Readonly<HoursDetailProps>) {
  const visibleHours = hours.filter(({ value }) => Number(value) > 0);

  if (visibleHours.length === 0) return null;

  return (
    <>
      <div className="font-semibold">{title}</div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm mt-1">
        {visibleHours.map(({ label, value }) => (
          <div key={label} className="flex items-center">
            <span className="font-medium mr-1">{label}:</span>
            <span>{Number(value)}h</span>
          </div>
        ))}
      </div>
    </>
  );
}

export const TotalHourForTask = ({ taskEntry }: { taskEntry: TaskEntry }) => {
  return (
    <HoursDetail
      title={taskEntry.taskTitle ? `Task: ${taskEntry.taskTitle}` : "Task"}
      hours={[
        { label: "Daytime", value: taskEntry.dayShiftHours },
        { label: "Nighttime", value: taskEntry.nightShiftHours },
        { label: "On Call", value: taskEntry.onCallHours },
        { label: "Travel", value: taskEntry.travelHours },
      ]}
    />
  );
};

export const TotalHourForDay = ({ dayEntry }: { dayEntry: DayEntry }) => {
  const bank = Number(dayEntry.bank) || 0;

  return (
    <HoursDetail
      title="Day"
      hours={[
        {
          label: "Leave",
          value: dayEntry.leaveHours,
        },
        {
          label: "Special Leave",
          value: dayEntry.specialLeaveHours,
        },
        {
          label: "Rest",
          value: dayEntry.restHours,
        },
        {
          label: "Bank From",
          value: bank < 0 ? Math.abs(bank) : 0,
        },
        {
          label: "Bank To",
          value: Math.max(bank, 0),
        },
      ]}
    />
  );
};
