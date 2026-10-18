import { describe, it, expect } from "vitest";
import type { AxiosError } from "axios";
import { parseApiErrors } from "./apiErrors";

const axiosError = (data: unknown, message = "Request failed with status code 400") =>
  ({ message, response: { data } }) as unknown as AxiosError;

describe("parseApiErrors", () => {
  it("splits field errors from nonFieldErrors and detail", () => {
    const result = parseApiErrors(
      axiosError({
        title: ["too long"],
        nonFieldErrors: ["to_date must be > from_date"],
        detail: "nope",
      })
    );

    expect(result).toEqual({
      fields: { title: ["too long"] },
      general: ["to_date must be > from_date", "nope"],
    });
  });

  it("treats a plain list response as general errors", () => {
    expect(parseApiErrors(axiosError(["Cannot change status SUBMITTED to SUBMITTED"]))).toEqual({
      fields: {},
      general: ["Cannot change status SUBMITTED to SUBMITTED"],
    });
  });

  it("falls back to the axios message when there is no body", () => {
    expect(parseApiErrors(axiosError(undefined, "Network Error"))).toEqual({
      fields: {},
      general: ["Network Error"],
    });
  });
});
