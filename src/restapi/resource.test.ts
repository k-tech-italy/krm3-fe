import {vi, describe, it, expect, beforeEach} from "vitest";
import {restapi} from "./restapi";
import {patchResourcePreferredLanguage} from "./resource.ts";

vi.mock("./restapi", () => ({
    restapi: {
        get: vi.fn(),
        patch: vi.fn(),
    },
}));

describe("Test Resource API", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("patchResourcePreferredLanguage", () => {
        it("should update the preferred language", async () => {
            const patchData = {resource_id: 1, language_code: "it", "next": "/",};
            vi.mocked(restapi.patch).mockResolvedValue({data: {...patchData}});

            const result = await patchResourcePreferredLanguage(
                patchData.language_code,
                patchData.resource_id
            );

            expect(restapi.patch).toHaveBeenCalledWith("core/resource/1/preferred-language/", patchData);
            expect(result).toMatchObject({data: patchData});
        });

    });
});