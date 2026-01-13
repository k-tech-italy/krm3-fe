import { Languages } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../../languages";
import DropDown from "./DropDown";
import {useChangeLanguage} from "../../hooks/useTranslation.tsx";
import {useAuthContext} from "./AuthContext.tsx";
import {useCookies} from "react-cookie";

export default function LanguageSwitcher() {
  const { mutate: changeLanguage, isLoading } = useChangeLanguage();
  const { user } = useAuthContext();
  const [cookies] = useCookies(["django_language"]);
  const currentLanguage = cookies.django_language;

  if (!user) throw new Error("User must be logged in");

  const sections = [
    {
      items: SUPPORTED_LANGUAGES.map(({ code, nativeName }) => ({
        label: nativeName,
        onClick: () => changeLanguage({ language_code: code, resourceId: user.resource.id }),
        disabled: isLoading || code === currentLanguage,
        active: code === currentLanguage,
      })),
    },
  ];


  return <DropDown icon={<Languages />} sections={sections} />;
}
