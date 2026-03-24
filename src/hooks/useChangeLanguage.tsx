import {useMutation, useQueryClient} from "react-query";
import {AxiosError} from "axios";
import {setDjangoLanguage} from "../restapi/translation.ts";
import {LanguageCode} from "../restapi/types.ts";
import i18n from "../i18n.ts";
import {patchResourcePreferredLanguage} from "../restapi/resource.ts";


type ChangeLanguageVariables = {
    language_code: LanguageCode;
    resourceId: number;
};

export function useChangeLanguage() {
    const queryClient = useQueryClient();

    return useMutation<void, AxiosError, ChangeLanguageVariables>(
        async ({language_code, resourceId}) => {
            await Promise.all([
                setDjangoLanguage(language_code),
                patchResourcePreferredLanguage(language_code, resourceId),
            ]);
        },
        {
            onSuccess: (_, {language_code}) => {
                i18n.changeLanguage(language_code);
                queryClient.invalidateQueries(["user"]);
            },
            onError: (error) => {
                console.error("Failed to update language:", error);
            },
        }
    );
}