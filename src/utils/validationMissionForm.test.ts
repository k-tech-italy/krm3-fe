import { describe, it, expect } from "vitest";
import { validateMission } from "./validationMissionForm";
import { MissionInterface, City, Country, Currency, Project, Client, Resource, ProfileInterface, ExpenseInterface } from "../restapi/types";

describe("validationMissionForm", () => {
  describe("validateMission", () => {
    const validMission: MissionInterface = {
      id: 1,
      number: 1,
      year: 2025,
      title: "Business Trip to New York",
      fromDate: "2025-01-15",
      toDate: "2025-01-20",
      city: {
        id: 1,
        name: "New York",
        country: { id: 1, name: "USA" } as Country,
      } as City,
      defaultCurrency: {
        iso3: "USD",
        title: "US Dollar",
        symbol: "$",
        fractionalUnit: "cent",
        base: 1,
        active: true,
      } as Currency,
      project: {
        id: 1,
        name: "Project Alpha",
        notes: "Important project",
        client: { id: 1, name: "Client A" } as Client,
      } as Project,
      resource: {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        profile: {
          id: 1,
          picture: "profile.jpg",
          user: 1,
        } as ProfileInterface,
      } as Resource,
      expenses: [],
    };

    describe("valid missions", () => {
      it("should resolve with valid mission", async () => {
        const result = await validateMission(validMission);

        expect(result).toEqual(validMission);
      });

      it("should accept mission with all required fields", async () => {
        const mission: MissionInterface = {
          ...validMission,
          title: "Conference in Paris",
          fromDate: "2025-02-01",
          toDate: "2025-02-05",
        };

        await expect(validateMission(mission)).resolves.toEqual(mission);
      });

      it("should accept mission with different city", async () => {
        const mission: MissionInterface = {
          ...validMission,
          city: {
            id: 2,
            name: "London",
            country: { id: 2, name: "UK" } as Country,
          } as City,
        };

        await expect(validateMission(mission)).resolves.toEqual(mission);
      });

      it("should accept mission with different project", async () => {
        const mission: MissionInterface = {
          ...validMission,
          project: {
            id: 2,
            name: "Project Beta",
            notes: "Secondary project",
            client: { id: 2, name: "Client B" } as Client,
          } as Project,
        };

        await expect(validateMission(mission)).resolves.toEqual(mission);
      });

      it("should accept mission with different resource", async () => {
        const mission: MissionInterface = {
          ...validMission,
          resource: {
            id: 2,
            firstName: "Jane",
            lastName: "Smith",
            profile: {
              id: 2,
              picture: "jane.jpg",
              user: 2,
            } as ProfileInterface,
          } as Resource,
        };

        await expect(validateMission(mission)).resolves.toEqual(mission);
      });

      it("should accept mission with expenses", async () => {
        const mission: MissionInterface = {
          ...validMission,
          expenses: [
            {
              id: 1,
              amount: 100,
            } as unknown as ExpenseInterface,
          ],
        };

        await expect(validateMission(mission)).resolves.toEqual(mission);
      });
    });

    describe("title validation", () => {
      it("should reject when title is missing", async () => {
        const mission: MissionInterface = {
          ...validMission,
          title: undefined as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          title: ["this field is required"],
        });
      });

      it("should reject when title is empty string", async () => {
        const mission: MissionInterface = {
          ...validMission,
          title: "",
        };

        await expect(validateMission(mission)).rejects.toEqual({
          title: ["this field is required"],
        });
      });

      it("should reject when title is null", async () => {
        const mission: MissionInterface = {
          ...validMission,
          title: null as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          title: ["this field is required"],
        });
      });
    });

    describe("fromDate validation", () => {
      it("should reject when fromDate is missing", async () => {
        const mission: MissionInterface = {
          ...validMission,
          fromDate: undefined as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          fromDate: ["this field is required"],
        });
      });

      it("should reject when fromDate is empty string", async () => {
        const mission: MissionInterface = {
          ...validMission,
          fromDate: "",
        };

        await expect(validateMission(mission)).rejects.toEqual({
          fromDate: ["this field is required"],
        });
      });

      it("should reject when fromDate is null", async () => {
        const mission: MissionInterface = {
          ...validMission,
          fromDate: null as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          fromDate: ["this field is required"],
        });
      });
    });

    describe("toDate validation", () => {
      it("should reject when toDate is missing", async () => {
        const mission: MissionInterface = {
          ...validMission,
          toDate: undefined as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          toDate: ["this field is required"],
        });
      });

      it("should reject when toDate is empty string", async () => {
        const mission: MissionInterface = {
          ...validMission,
          toDate: "",
        };

        await expect(validateMission(mission)).rejects.toEqual({
          toDate: ["this field is required"],
        });
      });

      it("should reject when toDate is null", async () => {
        const mission: MissionInterface = {
          ...validMission,
          toDate: null as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          toDate: ["this field is required"],
        });
      });
    });

    describe("project validation", () => {
      it("should reject when project is missing", async () => {
        const mission: MissionInterface = {
          ...validMission,
          project: undefined as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          project: ["this field is required"],
        });
      });

      it("should reject when project is null", async () => {
        const mission: MissionInterface = {
          ...validMission,
          project: null as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          project: ["this field is required"],
        });
      });
    });

    describe("resource validation", () => {
      it("should reject when resource is missing", async () => {
        const mission: MissionInterface = {
          ...validMission,
          resource: undefined as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          resource: ["this field is required"],
        });
      });

      it("should reject when resource is null", async () => {
        const mission: MissionInterface = {
          ...validMission,
          resource: null as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          resource: ["this field is required"],
        });
      });
    });

    describe("city validation", () => {
      it("should reject when city is missing", async () => {
        const mission: MissionInterface = {
          ...validMission,
          city: undefined as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          city: ["this field is required"],
        });
      });

      it("should reject when city is null", async () => {
        const mission: MissionInterface = {
          ...validMission,
          city: null as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          city: ["this field is required"],
        });
      });
    });

    describe("multiple validation errors", () => {
      it("should reject with all missing required fields", async () => {
        const mission: MissionInterface = {
          ...validMission,
          title: undefined as any,
          fromDate: undefined as any,
          toDate: undefined as any,
          project: undefined as any,
          resource: undefined as any,
          city: undefined as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          title: ["this field is required"],
          fromDate: ["this field is required"],
          toDate: ["this field is required"],
          project: ["this field is required"],
          resource: ["this field is required"],
          city: ["this field is required"],
        });
      });

      it("should reject with multiple errors - missing title and dates", async () => {
        const mission: MissionInterface = {
          ...validMission,
          title: "",
          fromDate: "",
          toDate: "",
        };

        await expect(validateMission(mission)).rejects.toEqual({
          title: ["this field is required"],
          fromDate: ["this field is required"],
          toDate: ["this field is required"],
        });
      });

      it("should reject with missing title and project", async () => {
        const mission: MissionInterface = {
          ...validMission,
          title: null as any,
          project: null as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          title: ["this field is required"],
          project: ["this field is required"],
        });
      });

      it("should reject with missing resource and city", async () => {
        const mission: MissionInterface = {
          ...validMission,
          resource: undefined as any,
          city: undefined as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          resource: ["this field is required"],
          city: ["this field is required"],
        });
      });

      it("should reject with missing dates and project", async () => {
        const mission: MissionInterface = {
          ...validMission,
          fromDate: "",
          toDate: null as any,
          project: undefined as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          fromDate: ["this field is required"],
          toDate: ["this field is required"],
          project: ["this field is required"],
        });
      });

      it("should reject with three missing fields", async () => {
        const mission: MissionInterface = {
          ...validMission,
          title: "",
          resource: null as any,
          city: undefined as any,
        };

        await expect(validateMission(mission)).rejects.toEqual({
          title: ["this field is required"],
          resource: ["this field is required"],
          city: ["this field is required"],
        });
      });
    });

    describe("edge cases", () => {
      it("should accept mission with minimal valid data", async () => {
        const minimalMission: MissionInterface = {
          id: 1,
          number: 1,
          year: 2025,
          title: "Short Mission",
          fromDate: "2025-01-01",
          toDate: "2025-01-01",
          city: {
            id: 1,
            name: "City",
            country: 1,
          } as City,
          defaultCurrency: {
            iso3: "EUR",
            title: "Euro",
            symbol: "€",
            fractionalUnit: "cent",
            base: 1,
            active: true,
          } as Currency,
          project: {
            id: 1,
            name: "Project",
            notes: "",
            client: 1,
          } as Project,
          resource: {
            id: 1,
            firstName: "A",
            lastName: "B",
            profile: {
              id: 1,
              picture: "",
              user: 1,
            } as ProfileInterface,
          } as Resource,
          expenses: [],
        };

        await expect(validateMission(minimalMission)).resolves.toEqual(minimalMission);
      });

      it("should accept mission with same fromDate and toDate", async () => {
        const mission: MissionInterface = {
          ...validMission,
          fromDate: "2025-01-15",
          toDate: "2025-01-15",
        };

        await expect(validateMission(mission)).resolves.toEqual(mission);
      });

      it("should accept mission with long title", async () => {
        const mission: MissionInterface = {
          ...validMission,
          title: "Very Long Mission Title That Describes The Business Trip In Great Detail",
        };

        await expect(validateMission(mission)).resolves.toEqual(mission);
      });

      it("should accept mission with toDate before fromDate", async () => {
        const mission: MissionInterface = {
          ...validMission,
          fromDate: "2025-01-20",
          toDate: "2025-01-15",
        };

        // No date logic validation in the function, so it should pass
        await expect(validateMission(mission)).resolves.toEqual(mission);
      });

      it("should handle mission with empty expenses array", async () => {
        const mission: MissionInterface = {
          ...validMission,
          expenses: [],
        };

        await expect(validateMission(mission)).resolves.toEqual(mission);
      });

      it("should accept mission with whitespace-only title as invalid", async () => {
        const mission: MissionInterface = {
          ...validMission,
          title: "   ",
        };

        // Whitespace is considered valid (not empty), so it passes
        await expect(validateMission(mission)).resolves.toEqual(mission);
      });
    });
  });
});
