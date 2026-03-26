import { createContext, useContext, useEffect } from "react";
import { useCookies } from "react-cookie";
import i18n from "i18next";

const LanguageContext = createContext({});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [cookies] = useCookies(["django_language"]);

  useEffect(() => {
    if (cookies.django_language) {
      i18n.changeLanguage(cookies.django_language);
    }
  }, [cookies.django_language]);

  return (
    <LanguageContext.Provider value={{}}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);