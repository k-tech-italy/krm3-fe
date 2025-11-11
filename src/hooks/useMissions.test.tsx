import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useCreateMission,
  useGetMissions,
  useGetResources,
  useGetActiveResources,
  useGetClients,
  useGetCountries,
  useGetCitiess,
  useGetProjects,
  useGetMission,
} from "./useMissions";
import * as missionApi from "../restapi/mission";
import * as useAuth from "./useAuth";
import {
  MissionInterface,
  Resource,
  Client,
  Country,
  City,
  Project,
  Page,
} from "../restapi/types";

// Mock the mission API
vi.mock("../restapi/mission", () => ({
  createMission: vi.fn(),
  getMissions: vi.fn(),
  getMission: vi.fn(),
  getResources: vi.fn(),
  getActiveResources: vi.fn(),
  getClients: vi.fn(),
  getCountries: vi.fn(),
  getCities: vi.fn(),
  getProjects: vi.fn(),
}));

// Mock the auth hook
vi.mock("./useAuth", () => ({
  useGetCurrentUser: vi.fn(),
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

describe("useMissions hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("useCreateMission", () => {
    const mockMission: MissionInterface = {
      id: 1,
      number: 1,
      title: "Test Mission",
      fromDate: "2024-01-01",
      toDate: "2024-12-31",
      year: 2024,
      city: {
        id: 1,
        name: "Warsaw",
        country: 1,
      },
      defaultCurrency: {
        iso3: "USD",
        title: "US Dollar",
        symbol: "$",
        fractionalUnit: "cent",
        base: 100,
        active: true,
      },
      project: {
        id: 1,
        name: "Test Project",
        notes: "Test notes",
        client: 1,
      },
      resource: {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        profile: {
          id: 1,
          picture: "path/to/picture.jpg",
          user: 1,
        },
      },
      expenses: [],
    };

    it("should create a mission successfully", async () => {
      vi.mocked(missionApi.createMission).mockResolvedValue({ data: mockMission } as any);

      const { result } = renderHook(() => useCreateMission(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockMission);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(missionApi.createMission).toHaveBeenCalledWith(mockMission);
    });

    it("should handle create mission error", async () => {
      vi.mocked(missionApi.createMission).mockRejectedValue(
        new Error("Failed to create mission")
      );

      const { result } = renderHook(() => useCreateMission(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockMission);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(missionApi.createMission).toHaveBeenCalledWith(mockMission);
    });

    it("should invalidate missions queries on success", async () => {
      vi.mocked(missionApi.createMission).mockResolvedValue({ data: mockMission } as any);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateMission(), { wrapper });

      result.current.mutate(mockMission);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: "missions" });
    });

    it("should handle error callback", async () => {
      const mockError = new Error("Create failed");
      vi.mocked(missionApi.createMission).mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreateMission(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockMission);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe("useGetMissions", () => {
    const mockMissions: Page<MissionInterface> = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          number: 1,
          title: "Test Mission",
          fromDate: "2024-01-01",
          toDate: "2024-12-31",
          year: 2024,
          city: {
            id: 1,
            name: "Warsaw",
            country: 1,
          },
          defaultCurrency: {
            iso3: "USD",
            title: "US Dollar",
            symbol: "$",
            fractionalUnit: "cent",
            base: 100,
            active: true,
          },
          project: {
            id: 1,
            name: "Test Project",
            notes: "Test notes",
            client: 1,
          },
          resource: {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            profile: {
              id: 1,
              picture: "path/to/picture.jpg",
              user: 1,
            },
          },
          expenses: [],
        },
      ],
    };

    it("should fetch missions for regular user with resource", async () => {
      vi.mocked(useAuth.useGetCurrentUser).mockReturnValue({
        data: {
          id: 1,
          resource: { id: 1, firstName: "John", lastName: "Doe" } as Resource,
          isStaff: false,
        },
      } as any);

      vi.mocked(missionApi.getMissions).mockResolvedValue(mockMissions);

      const { result } = renderHook(() => useGetMissions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMissions);
      expect(missionApi.getMissions).toHaveBeenCalledWith(false, 1);
    });

    it("should fetch missions for staff user", async () => {
      vi.mocked(useAuth.useGetCurrentUser).mockReturnValue({
        data: {
          id: 2,
          resource: { id: 2, firstName: "Jane", lastName: "Admin" } as Resource,
          isStaff: true,
        },
      } as any);

      vi.mocked(missionApi.getMissions).mockResolvedValue(mockMissions);

      const { result } = renderHook(() => useGetMissions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMissions);
      expect(missionApi.getMissions).toHaveBeenCalledWith(true, 2);
    });

    it("should fetch missions for user without resource", async () => {
      vi.mocked(useAuth.useGetCurrentUser).mockReturnValue({
        data: {
          id: 3,
          resource: null,
          isStaff: false,
        },
      } as any);

      vi.mocked(missionApi.getMissions).mockResolvedValue(mockMissions);

      const { result } = renderHook(() => useGetMissions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMissions);
      expect(missionApi.getMissions).toHaveBeenCalledWith(false, undefined);
    });

    it("should handle error when fetching missions", async () => {
      vi.mocked(useAuth.useGetCurrentUser).mockReturnValue({
        data: {
          id: 1,
          resource: { id: 1, firstName: "John", lastName: "Doe" } as Resource,
          isStaff: false,
        },
      } as any);

      vi.mocked(missionApi.getMissions).mockRejectedValue(
        new Error("Failed to fetch missions")
      );

      const { result } = renderHook(() => useGetMissions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
    });

    it("should use correct query key with user data", async () => {
      vi.mocked(useAuth.useGetCurrentUser).mockReturnValue({
        data: {
          id: 5,
          resource: { id: 5, firstName: "Test", lastName: "User" } as Resource,
          isStaff: false,
        },
      } as any);

      vi.mocked(missionApi.getMissions).mockResolvedValue(mockMissions);

      const queryClient = new QueryClient();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useGetMissions(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify the query is cached with the correct key
      const cachedData = queryClient.getQueryData(["missions", 5, false]);
      expect(cachedData).toEqual(mockMissions);
    });
  });

  describe("useGetResources", () => {
    const mockResources: Page<Resource> = {
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          profile: {
            id: 1,
            picture: "path/to/picture.jpg",
            user: 1,
          },
        },
        {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          profile: {
            id: 2,
            picture: "path/to/picture2.jpg",
            user: 2,
          },
        },
      ],
    };

    it("should fetch and return resources", async () => {
      vi.mocked(missionApi.getResources).mockResolvedValue(mockResources);

      const { result } = renderHook(() => useGetResources(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toEqual(mockResources);
      });

      expect(missionApi.getResources).toHaveBeenCalledTimes(1);
    });

    it("should return undefined when resources fetch fails", async () => {
      vi.mocked(missionApi.getResources).mockRejectedValue(
        new Error("Failed to fetch resources")
      );

      const { result } = renderHook(() => useGetResources(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it("should return undefined initially before data loads", () => {
      vi.mocked(missionApi.getResources).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useGetResources(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe("useGetActiveResources", () => {
    const mockActiveResources: Resource[] = [
      {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        profile: {
          id: 1,
          picture: "path/to/picture.jpg",
          user: 1,
        },
      },
    ];

    it("should fetch and return active resources", async () => {
      vi.mocked(missionApi.getActiveResources).mockResolvedValue(mockActiveResources);

      const { result } = renderHook(() => useGetActiveResources(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toEqual(mockActiveResources);
      });

      expect(missionApi.getActiveResources).toHaveBeenCalledTimes(1);
    });

    it("should return undefined when active resources fetch fails", async () => {
      vi.mocked(missionApi.getActiveResources).mockRejectedValue(
        new Error("Failed to fetch active resources")
      );

      const { result } = renderHook(() => useGetActiveResources(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it("should return undefined initially before data loads", () => {
      vi.mocked(missionApi.getActiveResources).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useGetActiveResources(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe("useGetClients", () => {
    const mockClients: Page<Client> = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: 1, name: "Client A" },
        { id: 2, name: "Client B" },
      ],
    };

    it("should fetch and return clients", async () => {
      vi.mocked(missionApi.getClients).mockResolvedValue(mockClients);

      const { result } = renderHook(() => useGetClients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toEqual(mockClients);
      });

      expect(missionApi.getClients).toHaveBeenCalledTimes(1);
    });

    it("should return undefined when clients fetch fails", async () => {
      vi.mocked(missionApi.getClients).mockRejectedValue(
        new Error("Failed to fetch clients")
      );

      const { result } = renderHook(() => useGetClients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it("should return undefined initially before data loads", () => {
      vi.mocked(missionApi.getClients).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useGetClients(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe("useGetCountries", () => {
    const mockCountries: Page<Country> = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: 1, name: "Poland" },
        { id: 2, name: "Italy" },
      ],
    };

    it("should fetch and return countries", async () => {
      vi.mocked(missionApi.getCountries).mockResolvedValue(mockCountries);

      const { result } = renderHook(() => useGetCountries(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toEqual(mockCountries);
      });

      expect(missionApi.getCountries).toHaveBeenCalledTimes(1);
    });

    it("should return undefined when countries fetch fails", async () => {
      vi.mocked(missionApi.getCountries).mockRejectedValue(
        new Error("Failed to fetch countries")
      );

      const { result } = renderHook(() => useGetCountries(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it("should return undefined initially before data loads", () => {
      vi.mocked(missionApi.getCountries).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useGetCountries(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe("useGetCitiess", () => {
    const mockCities: Page<City> = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: 1, name: "Warsaw", country: 1 },
        { id: 2, name: "Rome", country: 2 },
      ],
    };

    it("should fetch and return cities", async () => {
      vi.mocked(missionApi.getCities).mockResolvedValue(mockCities);

      const { result } = renderHook(() => useGetCitiess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toEqual(mockCities);
      });

      expect(missionApi.getCities).toHaveBeenCalledTimes(1);
    });

    it("should return undefined when cities fetch fails", async () => {
      vi.mocked(missionApi.getCities).mockRejectedValue(
        new Error("Failed to fetch cities")
      );

      const { result } = renderHook(() => useGetCitiess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it("should return undefined initially before data loads", () => {
      vi.mocked(missionApi.getCities).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useGetCitiess(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe("useGetProjects", () => {
    const mockProjects: Page<Project> = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: 1, name: "Project A", notes: "Notes A", client: 1 },
        { id: 2, name: "Project B", notes: "Notes B", client: 2 },
      ],
    };

    it("should fetch and return projects", async () => {
      vi.mocked(missionApi.getProjects).mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useGetProjects(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toEqual(mockProjects);
      });

      expect(missionApi.getProjects).toHaveBeenCalledTimes(1);
    });

    it("should return undefined when projects fetch fails", async () => {
      vi.mocked(missionApi.getProjects).mockRejectedValue(
        new Error("Failed to fetch projects")
      );

      const { result } = renderHook(() => useGetProjects(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it("should return undefined initially before data loads", () => {
      vi.mocked(missionApi.getProjects).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useGetProjects(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe("useGetMission", () => {
    const mockMission: MissionInterface = {
      id: 1,
      number: 1,
      title: "Test Mission",
      fromDate: "2024-01-01",
      toDate: "2024-12-31",
      year: 2024,
      city: {
        id: 1,
        name: "Warsaw",
        country: 1,
      },
      defaultCurrency: {
        iso3: "USD",
        title: "US Dollar",
        symbol: "$",
        fractionalUnit: "cent",
        base: 100,
        active: true,
      },
      project: {
        id: 1,
        name: "Test Project",
        notes: "Test notes",
        client: 1,
      },
      resource: {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        profile: {
          id: 1,
          picture: "path/to/picture.jpg",
          user: 1,
        },
      },
      expenses: [],
    };

    it("should fetch and return a specific mission", async () => {
      vi.mocked(missionApi.getMission).mockResolvedValue(mockMission);

      const { result } = renderHook(() => useGetMission(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMission);
      expect(missionApi.getMission).toHaveBeenCalledWith(1);
    });

    it("should handle error when fetching specific mission", async () => {
      vi.mocked(missionApi.getMission).mockRejectedValue(
        new Error("Failed to fetch mission")
      );

      const { result } = renderHook(() => useGetMission(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
    });

    it("should call onError callback when fetch fails", async () => {
      const mockError = new Error("Failed to fetch mission");
      vi.mocked(missionApi.getMission).mockRejectedValue(mockError);

      const { result } = renderHook(() => useGetMission(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });

    it("should use mission id in the API call", async () => {
      vi.mocked(missionApi.getMission).mockResolvedValue(mockMission);

      const { result } = renderHook(() => useGetMission(5), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify the correct ID was passed to the API
      expect(missionApi.getMission).toHaveBeenCalledWith(5);
    });
  });
});
