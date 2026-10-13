import {restapi} from "./restapi.ts";

type ResourceResponse = {
    preferred_language: string;
}

export function patchResourcePreferredLanguage(langCode: string, resourceId: number): Promise<ResourceResponse> {
    return restapi.patch(
        `core/resource/${resourceId}/preferred-language/`,
        {
            language_code: langCode,
            resource_id: resourceId,
            next: window.location.pathname
        }
    );
}

