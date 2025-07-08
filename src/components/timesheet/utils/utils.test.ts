import { getTaskColor, displayErrorMessage, getHolidayAndSickDays, isValidUrl, defaultColors } from './utils';
import * as timeEntryUtils from './timeEntry';
import { TimeEntry } from '../../../restapi/types';
import { vitest } from 'vitest';

describe('getTaskColor', () => {
  it('returns a color from defaultColors if no taskColor is provided', () => {
    const row = 2;
    const { backgroundColor, borderColor } = getTaskColor(row);
    expect(borderColor).toBe(defaultColors[row % defaultColors.length]);
    expect(backgroundColor).toBe(`${defaultColors[row % defaultColors.length]}50`);
  });

  it('returns the provided taskColor if given', () => {
    const row = 1;
    const color = '#123456';
    const { backgroundColor, borderColor } = getTaskColor(row, color);
    expect(borderColor).toBe(color);
    expect(backgroundColor).toBe(`${color}50`);
  });
});

describe('displayErrorMessage', () => {
  it('returns the error message from error.response.data.error', () => {
    const error = { response: { data: { error: 'Test error' } } };
    expect(displayErrorMessage(error)).toBe('Test error');
  });

  it('returns default message if error structure is not as expected', () => {
    expect(displayErrorMessage({})).toBe('an error occurred');
    expect(displayErrorMessage(undefined)).toBe('an error occurred');
  });
});


describe('isValidUrl', () => {
  it('returns true for valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
  });

  it('returns false for invalid URLs', () => {
    expect(isValidUrl('not a url')).toBe(false);
  });
}); 