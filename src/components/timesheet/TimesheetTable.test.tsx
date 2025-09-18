import {Days, Schedule, Task, TimeEntry, WeekRange} from "../../restapi/types.ts";
import {vi} from "vitest"
import Timesheet from "../../pages/Timesheet.tsx";
import {render, screen} from "@testing-library/react";
import * as useTimesheet from "../../hooks/useTimesheet.tsx";
describe('TimesheetTable', () => {
    const props = {
        setOpenTimeEntryModal: vi.fn(),
        setSelectedTask: vi.fn(),
        setIsDayEntry: vi.fn(),
        setStartDate: vi.fn(),
        setEndDate: vi.fn(),
        setTimeEntries: vi.fn(),
        setNoWorkingDay: vi.fn(),
        setSchedule: vi.fn(),
        scheduledDays: {},
        isColumnView: false,
        selectedResourceId: 1,
        readOnly: false,
        selectedWeekRange: "whole",
        setBankHours: vi.fn(),
        schedule: {}
    }
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(useTimesheet, 'useGetTimesheet').mockReturnValue({
            data: {
                timeEntries: [],
                days: [],
                schedule: {},
            },
            isLoading: true,
            isSuccess: false,
        });

    })
    it('renders loading icon', () => {
        render(<Timesheet {...props}/>)
        expect(screen.getByTestId("load-spinner-icon"))
    })
})