import { restapi } from "./restapi";

export interface EnvironmentInfo {
  environment: string;
  label: string;
  color: string;
}

// Probe the session endpoint: the response (403 included, before login) carries the
// environment headers set by the backend middleware.
export function getEnvironment(): Promise<EnvironmentInfo | null> {
  return restapi
    .get("/core/user/me/")
    .then((res) => environmentFromHeaders(res.headers))
    .catch((error) => environmentFromHeaders(error.response?.headers));
}

function environmentFromHeaders(headers: unknown): EnvironmentInfo | null {
  const h = (headers ?? {}) as Record<string, unknown>;
  // axios-case-converter camelizes response headers (x-environment -> xEnvironment).
  const environment = h["xEnvironment"] ?? h["x-environment"];
  const color = h["xEnvColor"] ?? h["x-env-color"];
  // Production sets no colour: never show a banner there by mistake.
  if (typeof environment !== "string" || !environment || typeof color !== "string" || !color) {
    return null;
  }
  return { environment, label: environment.toUpperCase(), color };
}
