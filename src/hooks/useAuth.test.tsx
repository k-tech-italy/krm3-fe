
import React, { ReactNode } from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useLogout, useGetCurrentUser } from "./useAuth";
import { clearToken } from "../restapi/oauth";
import { getCurrentUser, logout } from "../restapi/user";
import { vi } from "vitest";

vi.mock("../restapi/oauth", () => ({
  clearToken: vi.fn(),
}));

vi.mock("../restapi/user", () => ({
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useAuth", () => {
  beforeEach(() => {
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { replace: vi.fn() };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("useLogout", () => {
    it("should call logout, clearToken and redirect on success", async () => {
      (logout as jest.Mock).mockResolvedValue({});
      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(logout).toHaveBeenCalledTimes(1);
      expect(clearToken).toHaveBeenCalledTimes(1);
      expect(window.location.replace).toHaveBeenCalledWith("/login");
    });
  });

  describe("useGetCurrentUser", () => {
    it("should return user data on successful fetch", async () => {
      const user = { name: "Test User", isSuperuser: false, permissions: [] };
      (getCurrentUser as jest.Mock).mockResolvedValue(user);

      const { result } = renderHook(
        () => useGetCurrentUser(),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(user);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should not be authenticated on error", async () => {
      (getCurrentUser as jest.Mock).mockRejectedValue(new Error("Error"));

      const { result } = renderHook(
        () => useGetCurrentUser(),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should check permissions correctly", async () => {
      const user = {
        name: "Test User",
        isSuperuser: false,
        permissions: ["perm1"],
      };
      (getCurrentUser as jest.Mock).mockResolvedValue(user);

      const { result } = renderHook(
        () => useGetCurrentUser(),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.userCan(["perm1"])).toBe(true);
      expect(result.current.userCan(["perm2"])).toBe(false);
    });

    it("should return true for superuser regardless of permissions", async () => {
      const user = {
        name: "Test User",
        isSuperuser: true,
        permissions: [],
      };
      (getCurrentUser as jest.Mock).mockResolvedValue(user);

      const { result } = renderHook(
        () => useGetCurrentUser(),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.userCan(["perm1"])).toBe(true);
    });
  });
});
