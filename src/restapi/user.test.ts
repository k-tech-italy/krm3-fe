import { vi, describe, it, expect, beforeEach } from "vitest";
import * as userApi from "./user";
import { restapi } from "./restapi";
import { User, Resource, ProfileInterface, FlagsType } from "./types";

// Mock the restapi module
vi.mock("./restapi", () => ({
  restapi: {
    get: vi.fn(),
  },
}));

describe("user API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("should fetch current user data", async () => {
      const mockUser: User = {
        id: 1,
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        cid: "12345",
        isSuperuser: false,
        isStaff: false,
        isActive: true,
        lastLogin: "2025-01-15T10:00:00Z",
        permissions: ["view_dashboard", "edit_profile"],
        flags: {
          [FlagsType.TIMESHEET_ENABLED]: true,
          [FlagsType.TRASFERTE_ENABLED]: false,
        },
        config: {
          modules: [
            { flag: "timesheet", url: "/timesheet", label: "Timesheet" },
          ],
          defaultModule: "timesheet",
        },
        resource: {
          id: 10,
          firstName: "John",
          lastName: "Doe",
          profile: {
            id: 5,
            picture: "profile.jpg",
            user: 1,
          },
        },
        profile: {
          id: 5,
          picture: "profile.jpg",
          user: 1,
        },
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockUser });

      const result = await userApi.getCurrentUser();

      expect(restapi.get).toHaveBeenCalledWith("/core/user/me/");
      expect(result).toEqual(mockUser);
    });

    it("should return user with all required fields", async () => {
      const mockUser: User = {
        id: 2,
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Smith",
        username: "janesmith",
        cid: "67890",
        isSuperuser: false,
        isStaff: true,
        isActive: true,
        lastLogin: "2025-01-14T15:30:00Z",
        permissions: ["view_dashboard"],
        flags: {
          [FlagsType.TIMESHEET_ENABLED]: true,
          [FlagsType.TRASFERTE_ENABLED]: true,
        },
        config: {
          modules: [
            { flag: "timesheet", url: "/timesheet", label: "Timesheet" },
            { flag: "trasferte", url: "/trasferte", label: "Trasferte" },
          ],
        },
        resource: {
          id: 20,
          firstName: "Jane",
          lastName: "Smith",
          profile: {
            id: 10,
            picture: "jane.jpg",
            user: 2,
          },
        },
        profile: {
          id: 10,
          picture: "jane.jpg",
          user: 2,
        },
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockUser });

      const result = await userApi.getCurrentUser();

      expect(result.id).toBe(2);
      expect(result.email).toBe("jane@example.com");
      expect(result.firstName).toBe("Jane");
      expect(result.lastName).toBe("Smith");
      expect(result.username).toBe("janesmith");
      expect(result.isStaff).toBe(true);
    });

    it("should handle superuser with full permissions", async () => {
      const mockSuperuser: User = {
        id: 3,
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "User",
        username: "admin",
        cid: "00000",
        isSuperuser: true,
        isStaff: true,
        isActive: true,
        lastLogin: "2025-01-15T12:00:00Z",
        permissions: [
          "view_dashboard",
          "edit_profile",
          "manage_users",
          "admin_access",
        ],
        flags: {
          [FlagsType.TIMESHEET_ENABLED]: true,
          [FlagsType.TRASFERTE_ENABLED]: true,
        },
        config: {
          modules: [
            { flag: "timesheet", url: "/timesheet", label: "Timesheet" },
            { flag: "trasferte", url: "/trasferte", label: "Trasferte" },
            { flag: "admin", url: "/admin", label: "Admin" },
          ],
          defaultModule: "admin",
        },
        resource: {
          id: 1,
          firstName: "Admin",
          lastName: "User",
          profile: {
            id: 1,
            picture: "admin.jpg",
            user: 3,
          },
        },
        profile: {
          id: 1,
          picture: "admin.jpg",
          user: 3,
        },
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockSuperuser });

      const result = await userApi.getCurrentUser();

      expect(result.isSuperuser).toBe(true);
      expect(result.isStaff).toBe(true);
      expect(result.permissions).toContain("admin_access");
    });

    it("should handle user with null permissions", async () => {
      const mockUser: User = {
        id: 4,
        email: "newuser@example.com",
        firstName: "New",
        lastName: "User",
        username: "newuser",
        cid: "11111",
        isSuperuser: false,
        isStaff: false,
        isActive: true,
        lastLogin: "2025-01-15T08:00:00Z",
        permissions: null,
        flags: {
          [FlagsType.TIMESHEET_ENABLED]: false,
          [FlagsType.TRASFERTE_ENABLED]: false,
        },
        config: {
          modules: [],
        },
        resource: {
          id: 30,
          firstName: "New",
          lastName: "User",
          profile: {
            id: 15,
            picture: "default.jpg",
            user: 4,
          },
        },
        profile: {
          id: 15,
          picture: "default.jpg",
          user: 4,
        },
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockUser });

      const result = await userApi.getCurrentUser();

      expect(result.permissions).toBeNull();
    });

    it("should handle user with empty flags", async () => {
      const mockUser: User = {
        id: 5,
        email: "basic@example.com",
        firstName: "Basic",
        lastName: "User",
        username: "basicuser",
        cid: "22222",
        isSuperuser: false,
        isStaff: false,
        isActive: true,
        lastLogin: "2025-01-10T10:00:00Z",
        permissions: ["view_dashboard"],
        flags: {},
        config: {
          modules: [],
        },
        resource: {
          id: 40,
          firstName: "Basic",
          lastName: "User",
          profile: {
            id: 20,
            picture: "",
            user: 5,
          },
        },
        profile: {
          id: 20,
          picture: "",
          user: 5,
        },
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockUser });

      const result = await userApi.getCurrentUser();

      expect(result.flags).toEqual({});
    });

    it("should handle inactive user", async () => {
      const mockUser: User = {
        id: 6,
        email: "inactive@example.com",
        firstName: "Inactive",
        lastName: "User",
        username: "inactiveuser",
        cid: "33333",
        isSuperuser: false,
        isStaff: false,
        isActive: false,
        lastLogin: "2024-12-01T10:00:00Z",
        permissions: [],
        flags: {},
        config: {
          modules: [],
        },
        resource: {
          id: 50,
          firstName: "Inactive",
          lastName: "User",
          profile: {
            id: 25,
            picture: "",
            user: 6,
          },
        },
        profile: {
          id: 25,
          picture: "",
          user: 6,
        },
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockUser });

      const result = await userApi.getCurrentUser();

      expect(result.isActive).toBe(false);
    });

    it("should handle user with profile containing socialProfile", async () => {
      const mockUser: User = {
        id: 7,
        email: "social@example.com",
        firstName: "Social",
        lastName: "User",
        username: "socialuser",
        cid: "44444",
        isSuperuser: false,
        isStaff: false,
        isActive: true,
        lastLogin: "2025-01-15T14:00:00Z",
        permissions: ["view_dashboard"],
        flags: {
          [FlagsType.TIMESHEET_ENABLED]: true,
        },
        config: {
          modules: [
            { flag: "timesheet", url: "/timesheet", label: "Timesheet" },
          ],
        },
        resource: {
          id: 60,
          firstName: "Social",
          lastName: "User",
          profile: {
            id: 30,
            picture: "social.jpg",
            socialProfile: "https://linkedin.com/in/socialuser",
            user: 7,
          },
        },
        profile: {
          id: 30,
          picture: "social.jpg",
          socialProfile: "https://linkedin.com/in/socialuser",
          user: 7,
        },
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockUser });

      const result = await userApi.getCurrentUser();

      expect(result.profile.socialProfile).toBe(
        "https://linkedin.com/in/socialuser"
      );
    });

    it("should call correct endpoint", async () => {
      const mockUser: User = {
        id: 8,
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        username: "testuser",
        cid: "55555",
        isSuperuser: false,
        isStaff: false,
        isActive: true,
        lastLogin: "2025-01-15T09:00:00Z",
        permissions: [],
        flags: {},
        config: {
          modules: [],
        },
        resource: {
          id: 70,
          firstName: "Test",
          lastName: "User",
          profile: {
            id: 35,
            picture: "",
            user: 8,
          },
        },
        profile: {
          id: 35,
          picture: "",
          user: 8,
        },
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockUser });

      await userApi.getCurrentUser();

      expect(restapi.get).toHaveBeenCalledTimes(1);
      expect(restapi.get).toHaveBeenCalledWith("/core/user/me/");
    });
  });

  describe("logout", () => {
    it("should call logout endpoint", async () => {
      vi.mocked(restapi.get).mockResolvedValue({ data: undefined });

      await userApi.logout();

      expect(restapi.get).toHaveBeenCalledWith("/core/user/logout/");
    });

    it("should handle successful logout", async () => {
      vi.mocked(restapi.get).mockResolvedValue({ data: undefined });

      const result = await userApi.logout();

      expect(restapi.get).toHaveBeenCalledWith("/core/user/logout/");
      expect(result).toBeDefined();
    });

    it("should call logout endpoint exactly once", async () => {
      vi.mocked(restapi.get).mockResolvedValue({ data: undefined });

      await userApi.logout();

      expect(restapi.get).toHaveBeenCalledTimes(1);
    });

    it("should use GET method for logout", async () => {
      vi.mocked(restapi.get).mockResolvedValue({ data: undefined });

      await userApi.logout();

      expect(restapi.get).toHaveBeenCalledWith("/core/user/logout/");
    });

    it("should handle logout response without errors", async () => {
      vi.mocked(restapi.get).mockResolvedValue({
        data: undefined,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      });

      await expect(userApi.logout()).resolves.not.toThrow();
    });
  });
});
