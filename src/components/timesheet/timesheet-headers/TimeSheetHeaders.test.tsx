import TimeSheetHeaders from "./TimeSheetHeaders.tsx";
import { normalizeDate } from "../utils/dates";
import { render, screen } from "@testing-library/react";
import {vi} from "vitest";
import '@testing-library/jest-dom';


vi.mock('../utils/timeEntry', async () => {
    const actual = await vi.importActual('../utils/timeEntry');
    return {
        ...actual,
        isClosed: vi.fn(() => false),
        isToday: vi.fn(() => false),
    };
});

describe('TimesheetHeaders', () => {

    const baseDay = new Date();
    const baseEntry = {
        id: 1,
        dayShiftHours: 5,
        nightShiftHours: 0,
        restHours: 0,
        travelHours: 0,
        leaveHours: 0,
        onCallHours: 0,
        sickHours: 0,
        holidayHours: 0,
        date: baseDay.toISOString(),
        task: 1,
        specialLeaveHours: 0,
        bankFrom: 0,
        bankTo: 0,
        specialReason: undefined,
        comment: undefined,
    };
    const formattedDay = normalizeDate(baseDay).replaceAll("-", "_")
    const baseProps = {
        timesheet: {
            tasks: [{id: 1, title: 'some_task', startDate: baseDay}],
            days: {[normalizeDate(baseDay)] : {hol : false, nwd: false, closed : false}},
            bankHours: 0,
            timeEntries: [baseEntry],
            schedule: { [formattedDay]: 4 },
            timesheetColors: {
                lessThanScheduleColorBrightTheme: "#000000",
                exactScheduleColorBrightTheme: "#111111",
                moreThanScheduleColorBrightTheme: "#222222",
                lessThanScheduleColorDarkTheme: "#333333",
                exactScheduleColorDarkTheme: "#444444",
                moreThanScheduleColorDarkTheme: "#555555",
            }
        },
        scheduledDays: {days: [baseDay], numberOfDays: 1},
        isColumnView: false,
        isMonthView: false,
        isColumnActive: (index: number) => { return true },
        isColumnHighlighted: (index: number) => { return false },
        schedule: { [formattedDay]: 4 },

    }

    it('renders proper background for overtime hours' , () => {
        render(<TimeSheetHeaders {...baseProps}/>)
        const headerDiv = screen.getByTestId(`header-${normalizeDate(baseDay)}`);

        expect(headerDiv).toHaveStyle("--header-bg-light: #222222");
        expect(headerDiv).toHaveStyle("--header-bg-dark: #555555");
    })

    it('renders proper background for overtime hours' , () => {
        render(<TimeSheetHeaders {...baseProps} schedule={{[formattedDay]: 5}}/>)
        const headerDiv = screen.getByTestId(`header-${normalizeDate(baseDay)}`);

        expect(headerDiv).toHaveStyle("--header-bg-light: #111111");
        expect(headerDiv).toHaveStyle("--header-bg-dark: #444444");
    })

    it('renders proper background when worked hours are less than scheduled' , () => {
        render(<TimeSheetHeaders {...baseProps} schedule={{[formattedDay]: 6}}/>)
        const headerDiv = screen.getByTestId(`header-${normalizeDate(baseDay)}`);

        expect(headerDiv).toHaveStyle("--header-bg-light: #000000");
        expect(headerDiv).toHaveStyle("--header-bg-dark: #333333");
    })
    it('renders proper background for holiday or sick day' , () => {
        const otherDay = new Date(baseDay.setDate(baseDay.getDate() + 1)).toISOString();
        const holidayEntry = {
            id: 1,
            dayShiftHours: 0,
            nightShiftHours: 0,
            restHours: 0,
            travelHours: 0,
            leaveHours: 0,
            onCallHours: 0,
            sickHours: 0,
            holidayHours: 8,
            date: baseDay.toISOString(),
            task: 1,
            specialLeaveHours: 0,
            bankFrom: 0,
            bankTo: 0,
            specialReason: undefined,
            comment: undefined,
        };
        const sickDayEntry = {
            id: 2,
            dayShiftHours: 0,
            nightShiftHours: 0,
            restHours: 0,
            travelHours: 0,
            leaveHours: 0,
            onCallHours: 0,
            sickHours: 8,
            holidayHours: 0,
            date: otherDay,
            task: 1,
            specialLeaveHours: 0,
            bankFrom: 0,
            bankTo: 0,
            specialReason: undefined,
            comment: undefined,
        }
        render(<TimeSheetHeaders {...baseProps} schedule={{[formattedDay]: 6}} timesheet={{...baseProps.timesheet, timeEntries: [holidayEntry, sickDayEntry]}}/>)
        const headerDiv = screen.getByTestId(`header-${normalizeDate(baseDay)}`);
        const headerDivNextDay = screen.getByTestId(`header-${normalizeDate(otherDay)}`);
        
        expect(headerDiv).toHaveStyle("--header-bg-light: #111111");
        expect(headerDiv).toHaveStyle("--header-bg-dark: #444444");
        expect(headerDivNextDay).toHaveStyle("--header-bg-light: #111111");
        expect(headerDivNextDay).toHaveStyle("--header-bg-dark: #444444");
    })

})