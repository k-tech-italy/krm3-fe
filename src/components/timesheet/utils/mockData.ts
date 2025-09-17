
import {
  DayType,
  Schedule,
  TimeEntry,
  TimeSheet,
  WeekRange,
  Task,
  Days,
} from "../../../restapi/types";

export const mockWeekRange: WeekRange = {
  firstDay: new Date("2024-07-01"),
  lastDay: new Date("2024-07-07"),
};

export const mockScheduledDays = {
  days: [
    new Date("2024-07-01"),
    new Date("2024-07-02"),
    new Date("2024-07-03"),
    new Date("2024-07-04"),
    new Date("2024-07-05"),
    new Date("2024-07-06"),
    new Date("2024-07-07"),
  ],
  numberOfDays: 7,
};

export const mockTasks: Task[] = [
  {
    id: 1,
    name: "Test Task 1",
    projectId: 1,
    projectName: "Test Project",
    startDate: "2024-07-01",
    endDate: "2024-07-31",
  },
];

export const mockTimeEntries: TimeEntry[] = [
  {
    id: 1,
    date: "2024-07-01",
    hours: 8,
    taskId: 1,
    resourceId: 1,
    description: "Work on task 1",
  },
];

export const mockDays: Days = {
  "2024-07-01": DayType.WORKING_DAY,
  "2024-07-02": DayType.WORKING_DAY,
  "2024-07-03": DayType.WORKING_DAY,
  "2024-07-04": DayType.WORKING_DAY,
  "2024-07-05": DayType.WORKING_DAY,
  "2024-07-06": DayType.CLOSED_DAY,
  "2024-07-07": DayType.CLOSED_DAY,
};

export const mockSchedule: Schedule = {
  "2024-07-01": 8,
  "2024-07-02": 8,
  "2024-07-03": 8,
  "2024-07-04": 8,
  "2024-07-05": 8,
  "2024-07-06": 0,
  "2024-07-07": 0,
};

export const mockTimeSheet: TimeSheet = {
  timeEntries: mockTimeEntries,
  tasks: mockTasks,
  days: mockDays,
  schedule: mockSchedule,
  bankHours: "10",
  timesheetColors: {
    "1": "blue",
  },
  absenceDays: [],
  resources: [],
};
