import { vi, describe, it, expect, beforeEach } from "vitest";
import * as missionApi from "./mission";
import { restapi } from "./restapi";
import {
  City,
  Client,
  Country,
  MissionInterface,
  Page,
  Project,
  Resource,
} from "./types";

// Mock the restapi module
vi.mock("./restapi", () => ({
  restapi: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock moment
vi.mock("moment", () => ({
  default: vi.fn((date: string) => ({
    year: () => 2024,
  })),
}));

describe("mission API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createMission", () => {
    const mockCity: City = { id: 1, name: "Rome" } as City;
    const mockProject: Project = { id: 10, name: "Test Project" } as Project;
    const mockResource: Resource = { id: 5, firstName: "John", lastName: "Doe", profile: { id: 1, picture: "", user: 5 } } as Resource;

    const mockMissionParams: MissionInterface = {
      id: 1,
      project: mockProject,
      city: mockCity,
      resource: mockResource,
      toDate: "2024-12-31",
      fromDate: "2024-01-01",
      defaultCurrency: { iso3: "USD" },
    } as MissionInterface;

    it("should create a new mission with transformed parameters", async () => {
      const mockResponse = { data: mockMissionParams };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);

      await missionApi.createMission(mockMissionParams);

      expect(restapi.post).toHaveBeenCalledWith("missions/mission/", {
        ...mockMissionParams,
        project: 10,
        city: 1,
        resource: 5,
        year: 2024,
        defaultCurrency: "USD",
      });
    });

    it("should extract year from toDate", async () => {
      const mockResponse = { data: mockMissionParams };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);

      await missionApi.createMission(mockMissionParams);

      const callArgs = vi.mocked(restapi.post).mock.calls[0][1] as any;
      expect(callArgs).toHaveProperty("year", 2024);
    });

    it("should transform nested objects to IDs", async () => {
      const mockResponse = { data: mockMissionParams };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);

      await missionApi.createMission(mockMissionParams);

      const callArgs = vi.mocked(restapi.post).mock.calls[0][1] as any;
      expect(callArgs.project).toBe(10);
      expect(callArgs.city).toBe(1);
      expect(callArgs.resource).toBe(5);
      expect(callArgs.defaultCurrency).toBe("USD");
    });

    it("should handle mission without default currency", async () => {
      const missionWithoutCurrency = {
        ...mockMissionParams,
        defaultCurrency: undefined,
      };
      const mockResponse = { data: missionWithoutCurrency };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);

      await missionApi.createMission(missionWithoutCurrency as any);

      const callArgs = vi.mocked(restapi.post).mock.calls[0][1] as any;
      expect(callArgs.defaultCurrency).toBeUndefined();
    });

    it("should preserve other properties when transforming", async () => {
      const missionWithExtraProps = {
        ...mockMissionParams,
        description: "Test mission",
        status: "active",
      } as MissionInterface;
      const mockResponse = { data: missionWithExtraProps };
      vi.mocked(restapi.post).mockResolvedValue(mockResponse);

      await missionApi.createMission(missionWithExtraProps);

      const callArgs = vi.mocked(restapi.post).mock.calls[0][1] as any;
      expect(callArgs).toHaveProperty("description", "Test mission");
      expect(callArgs).toHaveProperty("status", "active");
    });
  });

  describe("getMissions", () => {
    const mockMissions: Page<MissionInterface> = {
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          project: { id: 10, name: "Project A" } as Project,
          city: { id: 1, name: "Rome" } as City,
        } as MissionInterface,
        {
          id: 2,
          project: { id: 20, name: "Project B" } as Project,
          city: { id: 2, name: "Milan" } as City,
        } as MissionInterface,
      ],
    };

    it("should fetch missions without parameters when resourceId is undefined", async () => {
      vi.mocked(restapi.get).mockResolvedValue({ data: mockMissions });

      const result = await missionApi.getMissions(false);

      expect(restapi.get).toHaveBeenCalledWith("missions/mission/", {
        params: {},
      });
      expect(result).toEqual(mockMissions);
    });

    it("should fetch missions with resourceId and isStaff parameters", async () => {
      vi.mocked(restapi.get).mockResolvedValue({ data: mockMissions });

      const result = await missionApi.getMissions(true, 5);

      expect(restapi.get).toHaveBeenCalledWith("missions/mission/", {
        params: { resource_id: 5, is_staff: true },
      });
      expect(result).toEqual(mockMissions);
    });

    it("should handle isStaff as false with resourceId", async () => {
      vi.mocked(restapi.get).mockResolvedValue({ data: mockMissions });

      await missionApi.getMissions(false, 10);

      expect(restapi.get).toHaveBeenCalledWith("missions/mission/", {
        params: { resource_id: 10, is_staff: false },
      });
    });

    it("should handle empty missions list", async () => {
      const mockEmptyPage: Page<MissionInterface> = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
      vi.mocked(restapi.get).mockResolvedValue({ data: mockEmptyPage });

      const result = await missionApi.getMissions(true, 1);

      expect(result.results).toHaveLength(0);
      expect(result.count).toBe(0);
    });

    it("should handle resourceId of 0", async () => {
      vi.mocked(restapi.get).mockResolvedValue({ data: mockMissions });

      await missionApi.getMissions(true, 0);

      expect(restapi.get).toHaveBeenCalledWith("missions/mission/", {
        params: { resource_id: 0, is_staff: true },
      });
    });
  });

  describe("getMission", () => {
    it("should fetch mission by id", async () => {
      const mockMission: MissionInterface = {
        id: 1,
        project: { id: 10, name: "Project A" } as Project,
        city: { id: 1, name: "Rome" } as City,
      } as MissionInterface;

      vi.mocked(restapi.get).mockResolvedValue({ data: mockMission });

      const result = await missionApi.getMission(1);

      expect(restapi.get).toHaveBeenCalledWith("missions/mission/1/");
      expect(result).toEqual(mockMission);
    });

    it("should fetch mission with different id", async () => {
      const mockMission: MissionInterface = {
        id: 99,
        project: { id: 50, name: "Project Z" } as Project,
        city: { id: 10, name: "Naples" } as City,
      } as MissionInterface;

      vi.mocked(restapi.get).mockResolvedValue({ data: mockMission });

      const result = await missionApi.getMission(99);

      expect(restapi.get).toHaveBeenCalledWith("missions/mission/99/");
      expect(result.id).toBe(99);
    });
  });

  describe("getResources", () => {
    const mockResources: Page<Resource> = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: 1, firstName: "John", lastName: "Doe", profile: { id: 1, picture: "", user: 1 } } as Resource,
        { id: 2, firstName: "Jane", lastName: "Smith", profile: { id: 2, picture: "", user: 2 } } as Resource,
      ],
    };

    it("should fetch resources without profile parameter", async () => {
      vi.mocked(restapi.get).mockResolvedValue({ data: mockResources });

      const result = await missionApi.getResources();

      expect(restapi.get).toHaveBeenCalledWith("core/resource/", {
        params: {},
      });
      expect(result).toEqual(mockResources);
    });

    it("should fetch resources with profile parameter", async () => {
      vi.mocked(restapi.get).mockResolvedValue({ data: mockResources });

      const result = await missionApi.getResources(5);

      expect(restapi.get).toHaveBeenCalledWith("core/resource/", {
        params: { profile_id: 5 },
      });
      expect(result).toEqual(mockResources);
    });

    it("should handle profile of 0", async () => {
      vi.mocked(restapi.get).mockResolvedValue({ data: mockResources });

      await missionApi.getResources(0);

      expect(restapi.get).toHaveBeenCalledWith("core/resource/", {
        params: { profile_id: 0 },
      });
    });

    it("should handle empty resources list", async () => {
      const mockEmptyPage: Page<Resource> = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
      vi.mocked(restapi.get).mockResolvedValue({ data: mockEmptyPage });

      const result = await missionApi.getResources(10);

      expect(result.results).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getActiveResources", () => {
    it("should fetch active resources", async () => {
      const mockActiveResources: Resource[] = [
        { id: 1, firstName: "John", lastName: "Doe", profile: { id: 1, picture: "", user: 1 } } as Resource,
        { id: 2, firstName: "Jane", lastName: "Smith", profile: { id: 2, picture: "", user: 2 } } as Resource,
      ];

      vi.mocked(restapi.get).mockResolvedValue({ data: mockActiveResources });

      const result = await missionApi.getActiveResources();

      expect(restapi.get).toHaveBeenCalledWith("core/resource/active/");
      expect(result).toEqual(mockActiveResources);
      expect(result).toHaveLength(2);
    });

    it("should return empty array on error", async () => {
      vi.mocked(restapi.get).mockRejectedValue(new Error("API Error"));

      const result = await missionApi.getActiveResources();

      expect(result).toEqual([]);
    });

    it("should handle empty active resources list", async () => {
      vi.mocked(restapi.get).mockResolvedValue({ data: [] });

      const result = await missionApi.getActiveResources();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("getClients", () => {
    it("should fetch clients list", async () => {
      const mockClients: Page<Client> = {
        count: 2,
        next: null,
        previous: null,
        results: [
          { id: 1, name: "Client A" } as Client,
          { id: 2, name: "Client B" } as Client,
        ],
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockClients });

      const result = await missionApi.getClients();

      expect(restapi.get).toHaveBeenCalledWith("core/client/");
      expect(result).toEqual(mockClients);
      expect(result.results).toHaveLength(2);
    });

    it("should handle empty clients list", async () => {
      const mockEmptyPage: Page<Client> = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockEmptyPage });

      const result = await missionApi.getClients();

      expect(result.results).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getCountries", () => {
    it("should fetch countries list", async () => {
      const mockCountries: Page<Country> = {
        count: 3,
        next: null,
        previous: null,
        results: [
          { id: 1, name: "Italy" } as Country,
          { id: 2, name: "France" } as Country,
          { id: 3, name: "Germany" } as Country,
        ],
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockCountries });

      const result = await missionApi.getCountries();

      expect(restapi.get).toHaveBeenCalledWith("core/country/");
      expect(result).toEqual(mockCountries);
      expect(result.results).toHaveLength(3);
    });

    it("should return correct endpoint for countries", async () => {
      vi.mocked(restapi.get).mockResolvedValue({
        data: { count: 0, next: null, previous: null, results: [] },
      });

      await missionApi.getCountries();

      expect(restapi.get).toHaveBeenCalledWith("core/country/");
    });
  });

  describe("getCities", () => {
    it("should fetch cities list", async () => {
      const mockCities: Page<City> = {
        count: 3,
        next: null,
        previous: null,
        results: [
          { id: 1, name: "Rome" } as City,
          { id: 2, name: "Milan" } as City,
          { id: 3, name: "Naples" } as City,
        ],
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockCities });

      const result = await missionApi.getCities();

      expect(restapi.get).toHaveBeenCalledWith("core/city/");
      expect(result).toEqual(mockCities);
      expect(result.results).toHaveLength(3);
    });

    it("should return correct endpoint for cities", async () => {
      vi.mocked(restapi.get).mockResolvedValue({
        data: { count: 0, next: null, previous: null, results: [] },
      });

      await missionApi.getCities();

      expect(restapi.get).toHaveBeenCalledWith("core/city/");
    });
  });

  describe("getProjects", () => {
    it("should fetch projects list", async () => {
      const mockProjects: Page<Project> = {
        count: 3,
        next: null,
        previous: null,
        results: [
          { id: 1, name: "Project Alpha" } as Project,
          { id: 2, name: "Project Beta" } as Project,
          { id: 3, name: "Project Gamma" } as Project,
        ],
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockProjects });

      const result = await missionApi.getProjects();

      expect(restapi.get).toHaveBeenCalledWith("core/project/");
      expect(result).toEqual(mockProjects);
      expect(result.results).toHaveLength(3);
    });

    it("should handle empty projects list", async () => {
      const mockEmptyPage: Page<Project> = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockEmptyPage });

      const result = await missionApi.getProjects();

      expect(result.results).toHaveLength(0);
      expect(result.count).toBe(0);
    });

    it("should return correct endpoint for projects", async () => {
      vi.mocked(restapi.get).mockResolvedValue({
        data: { count: 0, next: null, previous: null, results: [] },
      });

      await missionApi.getProjects();

      expect(restapi.get).toHaveBeenCalledWith("core/project/");
    });
  });
});
