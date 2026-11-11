import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import EnvironmentBanner from "./EnvironmentBanner.tsx";
import * as environmentApi from "../../restapi/environment.ts";

describe("EnvironmentBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the banner when the environment is not production", async () => {
    vi.spyOn(environmentApi, "getEnvironment").mockResolvedValue({
      environment: "int",
      label: "INT",
      color: "#86efac",
    });
    render(<EnvironmentBanner />);
    const banner = await screen.findByTestId("environment-banner");
    expect(banner).toHaveTextContent("INT");
    expect(banner).toHaveStyle({ backgroundColor: "#86efac" });
  });

  it("renders the LOCAL banner for the local environment", async () => {
    vi.spyOn(environmentApi, "getEnvironment").mockResolvedValue({
      environment: "local",
      label: "LOCAL",
      color: "#fed7aa",
    });
    render(<EnvironmentBanner />);
    expect(await screen.findByTestId("environment-banner")).toHaveTextContent("LOCAL");
  });

  it("does not render the banner on production (no colour header)", async () => {
    vi.spyOn(environmentApi, "getEnvironment").mockResolvedValue(null);
    render(<EnvironmentBanner />);
    await waitFor(() => expect(environmentApi.getEnvironment).toHaveBeenCalled());
    expect(screen.queryByTestId("environment-banner")).not.toBeInTheDocument();
  });

  it("does not render the banner when the request fails", async () => {
    vi.spyOn(environmentApi, "getEnvironment").mockRejectedValue(new Error("network error"));
    render(<EnvironmentBanner />);
    await waitFor(() => expect(environmentApi.getEnvironment).toHaveBeenCalled());
    expect(screen.queryByTestId("environment-banner")).not.toBeInTheDocument();
  });
});
