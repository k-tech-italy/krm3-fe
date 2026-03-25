import {restapi} from "./restapi";
import {LanguageMap} from "./types";


export function setDjangoLanguage(langCode: string) {
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


export function getSupportedLanguages(): Promise<LanguageMap[]> {
    return restapi.get('core/supported-languages/').then((res) => {
        return res.data;
    });
}