import {vi, describe, it, expect, beforeEach} from "vitest";
import {restapi} from "./restapi";
import {setDjangoLanguage} from "./translation.ts";

vi.mock("./restapi", () => ({
    restapi: {
        post: vi.fn(),
    },
}));

describe("Test Language API", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(window, "location", {
            value: {pathname: "/some/path"},
            writable: true,
        });
    });

    describe("setDjangoLanguage", () => {
        it("should post the language code to the i18n endpoint", async () => {
            const langCode = "it";
            const expectedBody = new URLSearchParams({
                language: langCode,
                next: window.location.pathname,
            });

            vi.mocked(restapi.post).mockResolvedValue({data: {}});

            const result = await setDjangoLanguage(langCode);

            expect(restapi.post).toHaveBeenCalledWith(
                "i18n/setlang/",
                expectedBody,
                {headers: {"Content-Type": "application/x-www-form-urlencoded"}}
            );
            expect(result).toEqual({data: {}});
        });
    });
});