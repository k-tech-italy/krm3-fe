import { useMutation, useQuery } from "react-query";
import { AxiosError } from "axios";
import { getSupportedLanguages, setDjangoLanguage } from "../restapi/translation.ts";
import i18n from "../i18n.ts";
import { patchUserPreferredLanguage } from "../restapi/user.ts";

type ChangeLanguageVariables = {
  language_code: string;
};

export function useChangeLanguage() {
  return useMutation<void, AxiosError, ChangeLanguageVariables>(
    async ({ language_code }) => {
      await Promise.all([
        setDjangoLanguage(language_code),
        patchUserPreferredLanguage(language_code),
      ]);
    },
    {
      onSuccess: (_, { language_code }) => {
        i18n.changeLanguage(language_code);
      },
      onError: (error) => {
        console.error("Failed to update language:", error);
      },
    }
  );
}

export function useGetSupportedLanguages() {
  return useQuery("languages", () => getSupportedLanguages(), {
    staleTime: 1000 * 60 * 60 * 24, // 24h - the supported languages are not changing often
    onError: (error) => {
      return error;
    },
  });
}
