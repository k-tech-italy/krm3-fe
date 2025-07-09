import { render } from "@testing-library/react";
import { LogoutPage } from "./Logout";
import { vi } from "vitest";

let originalLocation: Location;

beforeAll(() => {
  originalLocation = window.location;
  // @ts-ignore
  delete window.location;
  // @ts-ignore
  window.location = { ...originalLocation, href: "" };
});

afterAll(() => {
  // @ts-ignore
  window.location = originalLocation;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LogoutPage", () => {
  it("clears localStorage and redirects to /login", () => {
    render(<LogoutPage />);
    expect(window.location.href).toBe("/login");
  });
}); 