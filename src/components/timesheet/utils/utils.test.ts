import { defaultColors, displayErrorMessage, getTaskColor, isValidUrl } from "./utils";

describe("getTaskColor", () => {
  it("returns a color from defaultColors if no taskColor is provided", () => {
    const row = 2;
    const { backgroundColor, borderColor } = getTaskColor(row);
    expect(borderColor).toBe(defaultColors[row % defaultColors.length]);
    expect(backgroundColor).toBe(`${defaultColors[row % defaultColors.length]}50`);
  });

  it("returns the provided taskColor if given", () => {
    const row = 1;
    const color = "#123456";
    const { backgroundColor, borderColor } = getTaskColor(row, color);
    expect(borderColor).toBe(color);
    expect(backgroundColor).toBe(`${color}50`);
  });
});

describe("displayErrorMessage", () => {
  it("returns the error message from error.response.data.error", () => {
    const error = { isAxiosError: true, response: { data: { error: "Test error" } } };
    expect(displayErrorMessage(error)).toBe("Test error");
  });

  it("returns model validation errors from a top-level array", () => {
    const error = {
      isAxiosError: true,
      response: {
        data: [
          "_verify_bank_hours_against_scheduled_hours: ['Cannot deposit bank hours.']",
          "_verify_bank_hours_balance_limits: ['The maximum bank balance would be exceeded.']",
        ],
      },
    };

    expect(displayErrorMessage(error)).toBe(
      "Cannot deposit bank hours. — The maximum bank balance would be exceeded."
    );
  });

  it("returns an unstructured array error without changing it", () => {
    const error = { isAxiosError: true, response: { data: ["Unexpected API error"] } };
    expect(displayErrorMessage(error)).toBe("Unexpected API error");
  });

  it("returns a DRF field error", () => {
    const error = {
      isAxiosError: true,
      response: { data: { dates: ["This list may not be empty."] } },
    };
    expect(displayErrorMessage(error)).toBe("This list may not be empty.");
  });

  it("returns a nested DRF field error", () => {
    const error = {
      isAxiosError: true,
      response: {
        data: { leaveHours: { error: "Hours must be between 0 and 24." } },
      },
    };
    expect(displayErrorMessage(error)).toBe("Hours must be between 0 and 24.");
  });

  it("joins multiple DRF field errors", () => {
    const error = {
      isAxiosError: true,
      response: {
        data: {
          dates: ["This list may not be empty."],
          resource: ["Invalid primary key."],
        },
      },
    };
    expect(displayErrorMessage(error)).toBe("This list may not be empty. — Invalid primary key.");
  });

  it("returns default message if error structure is not as expected", () => {
    expect(displayErrorMessage({})).toBe("an error occurred");
    expect(displayErrorMessage(undefined)).toBe("an error occurred");
  });
});

describe("isValidUrl", () => {
  it("returns true for valid URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://localhost:3000")).toBe(true);
  });

  it("returns false for invalid URLs", () => {
    expect(isValidUrl("not a url")).toBe(false);
  });
});
