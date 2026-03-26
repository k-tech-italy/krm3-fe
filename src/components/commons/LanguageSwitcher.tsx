import { Languages } from "lucide-react";
import DropDown from "./DropDown";
import { useChangeLanguage, useGetSupportedLanguages } from "../../hooks/useTranslation.tsx";
import { useAuthContext } from "./AuthContext.tsx";
import { useCookies } from "react-cookie";

export default function LanguageSwitcher() {
  const { mutate: changeLanguage, isLoading } = useChangeLanguage();
  const { data: languages = [] } = useGetSupportedLanguages();
  const { user } = useAuthContext();
  const [cookies] = useCookies(["django_language"]);
  const currentLanguage = cookies.django_language;

  if (!user) throw new Error("User must be logged in");

  const sections = [
    {
      items: languages.map(({ languageCode, language }) => ({
        label: language,
        onClick: () =>
          changeLanguage({ language_code: languageCode, resourceId: user.resource.id }),
        disabled: isLoading || languageCode === currentLanguage,
        active: languageCode === currentLanguage,
      })),
    },
  ];

  return <DropDown icon={<Languages />} sections={sections} />;
}
