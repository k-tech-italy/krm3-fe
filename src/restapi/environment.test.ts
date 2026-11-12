import { vi, describe, it, expect, beforeEach } from "vitest";
import * as environmentApi from "./environment";
import { restapi } from "./restapi";

// Mock the restapi module
vi.mock("./restapi", () => ({
  restapi: {
    get: vi.fn(),
  },
}));

describe("environment API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEnvironment", () => {
    it("should read the environment headers from a successful response", async () => {
      vi.mocked(restapi.get).mockResolvedValue({
        headers: { xEnvironment: "int", xEnvColor: "#86efac" },
      });

      const result = await environmentApi.getEnvironment();

      expect(restapi.get).toHaveBeenCalledTimes(1);
      expect(restapi.get).toHaveBeenCalledWith("/core/user/me/");
      expect(result).toEqual({ environment: "int", label: "INT", color: "#86efac" });
    });

    it("should read the environment headers from an error response (not authenticated)", async () => {
      vi.mocked(restapi.get).mockRejectedValue({
        response: { headers: { xEnvironment: "local", xEnvColor: "#fed7aa" } },
      });

      const result = await environmentApi.getEnvironment();

      expect(result).toEqual({ environment: "local", label: "LOCAL", color: "#fed7aa" });
    });

    it("should also accept headers not camelized by axios-case-converter", async () => {
      vi.mocked(restapi.get).mockResolvedValue({
        headers: { "x-environment": "local", "x-env-color": "#fed7aa" },
      });

      const result = await environmentApi.getEnvironment();

      expect(result).toEqual({ environment: "local", label: "LOCAL", color: "#fed7aa" });
    });

    it("should return null when the colour header is missing (production)", async () => {
      vi.mocked(restapi.get).mockResolvedValue({
        headers: { xEnvironment: "production" },
      });

      const result = await environmentApi.getEnvironment();

      expect(result).toBeNull();
    });

    it("should return null when the probe fails without a response", async () => {
      vi.mocked(restapi.get).mockRejectedValue(new Error("network error"));

      const result = await environmentApi.getEnvironment();

      expect(result).toBeNull();
    });
  });
});
