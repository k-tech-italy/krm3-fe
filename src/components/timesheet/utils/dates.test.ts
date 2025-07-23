import {getFirstDayOfMonth, getLastDayOfMonth} from "./dates.ts";

describe('getFirstDayOfMonth', () => {
    it('returns correct day', () => {
        const day = new Date(2019, 2, 15);
        const fistDay = getFirstDayOfMonth(day);
        expect(fistDay.getFullYear()).toBe(2019);
        expect(fistDay.getMonth()).toBe(2);
        expect(fistDay.getDate()).toBe(1);
    })
})
describe('getLastDayOfMonth', () => {
    const cases = [
        [2019, 4, 5, 31],
        [2019, 5, 1, 30],
        [2019, 1, 17, 28],
        [2016, 1, 10, 29],
    ];

    cases.forEach(([year, month, day, expected_day]) => {
        it(`returns correct last day for ${year}-${month + 1}-${day}`, () => {
            const date = new Date(year, month, day);
            const lastDay = getLastDayOfMonth(date);
            expect(lastDay.getFullYear()).toBe(year);
            expect(lastDay.getMonth()).toBe(month);
            expect(lastDay.getDate()).toBe(expected_day);
        });
    });
});