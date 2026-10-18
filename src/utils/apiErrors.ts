import type { AxiosError } from "axios";

export interface ApiErrors {
  // per-field messages, keyed by the (camelCase) field name
  fields: Record<string, string[]>;
  // messages not bound to a field (nonFieldErrors, detail, plain lists)
  general: string[];
}

const GENERAL_KEYS = ["nonFieldErrors", "detail"];

const asList = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [value]).filter((v) => v !== undefined && v !== null).map(String);

/** Split a DRF error response into field and general messages. */
export function parseApiErrors(error: unknown): ApiErrors {
  const result: ApiErrors = { fields: {}, general: [] };
  const axiosError = error as AxiosError;
  const data = axiosError?.response?.data;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (GENERAL_KEYS.includes(key)) {
        result.general.push(...asList(value));
      } else {
        result.fields[key] = asList(value);
      }
    }
  } else if (Array.isArray(data) || typeof data === "string") {
    result.general.push(...asList(data));
  }

  if (!result.general.length && !Object.keys(result.fields).length && axiosError?.message) {
    result.general.push(axiosError.message);
  }
  return result;
}
