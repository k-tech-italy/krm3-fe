import { restapi} from "./restapi";
import {LanguageCode} from "./types";

export function setDjangoLanguage(langCode: LanguageCode) {
    return restapi.post(
        "i18n/setlang/",
        new URLSearchParams({
            language: langCode,
            next: window.location.pathname,
        }),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );
}