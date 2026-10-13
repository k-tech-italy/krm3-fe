import { isAxiosError } from "axios";

export function isForbidden(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 403;
}
