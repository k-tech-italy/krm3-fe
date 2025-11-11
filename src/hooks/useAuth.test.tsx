import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useGetCurrentUser, useLogout } from "./useAuth";
import * as userApi from "../restapi/user";
import { User } from "../restapi/types";

// Mock the user API
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
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useGetCurrentUser", () => {
  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    isSuperuser: false,
    isStaff: false,
    isActive: true,
    lastLogin: "2024-01-01T00:00:00Z",
    resource: {
      id: 1,
      firstName: "John",
      lastName: "Doe",
    } as any,
    profile: {} as any,
    username: "johndoe",
    cid: "123",
    permissions: ["view_timesheet", "edit_timesheet"],
    flags: {},
    config: {
      modules: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch and return current user data", async () => {
    vi.mocked(userApi.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useGetCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
    expect(userApi.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("should set isAuthenticated to true when user data exists", async () => {
    vi.mocked(userApi.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useGetCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it("should set isAuthenticated to false when user data is null", async () => {
    vi.mocked(userApi.getCurrentUser).mockRejectedValue(new Error("Unauthorized"));

    const { result } = renderHook(() => useGetCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should identify superuser correctly", async () => {
    const superUser = { ...mockUser, isSuperuser: true };
    vi.mocked(userApi.getCurrentUser).mockResolvedValue(superUser);

    const { result } = renderHook(() => useGetCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.isSuperuser).toBe(true);
  });

  describe("userCan permission check", () => {
    it("should return true when user has all required permissions", async () => {
      vi.mocked(userApi.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useGetCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.userCan(["view_timesheet"])).toBe(true);
      expect(result.current.userCan(["view_timesheet", "edit_timesheet"])).toBe(true);
    });

    it("should return false when user lacks required permissions", async () => {
      vi.mocked(userApi.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useGetCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.userCan(["delete_timesheet"])).toBe(false);
      expect(result.current.userCan(["view_timesheet", "delete_timesheet"])).toBe(false);
    });

    it("should return true for superuser regardless of permissions", async () => {
      const superUser = { ...mockUser, isSuperuser: true, permissions: [] };
      vi.mocked(userApi.getCurrentUser).mockResolvedValue(superUser);

      const { result } = renderHook(() => useGetCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.userCan(["any_permission"])).toBe(true);
      expect(result.current.userCan(["view_timesheet", "delete_timesheet"])).toBe(true);
    });

    it("should return false when user is not authenticated", async () => {
      vi.mocked(userApi.getCurrentUser).mockRejectedValue(new Error("Unauthorized"));

      const { result } = renderHook(() => useGetCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.userCan(["view_timesheet"])).toBe(false);
    });

    it("should handle null permissions array", async () => {
      const userWithNullPermissions = { ...mockUser, permissions: null };
      vi.mocked(userApi.getCurrentUser).mockResolvedValue(userWithNullPermissions);

      const { result } = renderHook(() => useGetCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.userCan(["view_timesheet"])).toBe(false);
    });
  });

  describe("refreshUser", () => {
    it("should invalidate and refetch user data", async () => {
      vi.mocked(userApi.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useGetCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(userApi.getCurrentUser).toHaveBeenCalledTimes(1);

      // Update mock to return different data
      const updatedUser = { ...mockUser, firstName: "Jane" };
      vi.mocked(userApi.getCurrentUser).mockResolvedValue(updatedUser);

      await result.current.refreshUser();

      await waitFor(() => {
        expect(result.current.data?.firstName).toBe("Jane");
      });

      expect(userApi.getCurrentUser).toHaveBeenCalledTimes(2);
    });
  });

  describe("clearUser", () => {
    it("should clear user data from cache", async () => {
      vi.mocked(userApi.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useGetCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockUser);
      });

      result.current.clearUser();

      await waitFor(() => {
        expect(result.current.data).toBeNull();
      });
    });
  });

  it("should not retry on error", async () => {
    vi.mocked(userApi.getCurrentUser).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useGetCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Should only be called once due to retry: false
    expect(userApi.getCurrentUser).toHaveBeenCalledTimes(1);
  });
});

describe("useLogout", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.replace
    delete (window as any).location;
    window.location = { ...originalLocation, replace: vi.fn() };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.location = originalLocation;
  });

  it("should call logout API and redirect to login on success", async () => {
    vi.mocked(userApi.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(userApi.logout).toHaveBeenCalledTimes(1);
    expect(window.location.replace).toHaveBeenCalledWith("/login");
  });

  it("should handle logout error silently", async () => {
    vi.mocked(userApi.logout).mockRejectedValue(new Error("Logout failed"));

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(userApi.logout).toHaveBeenCalledTimes(1);
    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it("should not redirect when logout fails", async () => {
    vi.mocked(userApi.logout).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(window.location.replace).not.toHaveBeenCalled();
  });
});
