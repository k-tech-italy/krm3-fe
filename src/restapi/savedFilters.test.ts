import { beforeEach, describe, expect, it, vi } from "vitest";
import { restapi } from "./restapi";
import { listSavedFilters, saveFilter } from "./savedFilters";

vi.mock("./restapi", () => ({
  restapi: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("saved filters API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists the saved filters of a page", async () => {
    vi.mocked(restapi.get).mockResolvedValue({ data: [{ id: 1 }] });

    await expect(listSavedFilters("missions")).resolves.toEqual([{ id: 1 }]);
    expect(restapi.get).toHaveBeenCalledWith("core/saved-filter/", {
      params: { page: "missions" },
    });
  });

  it("saves a filter", async () => {
    const payload = {
      page: "missions",
      name: "Mine",
      values: {},
      summary: "",
      url: "/trasferte",
      isDefault: true,
    };
    vi.mocked(restapi.post).mockResolvedValue({ data: { id: 2, ...payload } });

    await expect(saveFilter(payload)).resolves.toEqual({ id: 2, ...payload });
    expect(restapi.post).toHaveBeenCalledWith("core/saved-filter/", payload);
  });
});
