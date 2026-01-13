import {LanguageCode} from "./types.ts";
import {restapi} from "./restapi.ts";

type ResourceResponse = {
    preferred_language: LanguageCode;
}

export function patchResourcePreferredLanguage(langCode: LanguageCode, resourceId: number): Promise<ResourceResponse> {
    return restapi.patch(
        `core/resource/${resourceId}/preferred-language/`,
        {
            language_code: langCode,
            resource_id: resourceId,
            next: window.location.pathname
        }
    );
}

