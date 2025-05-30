import { useState, useEffect } from "react";

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);

    updateMatch();
    media.addEventListener("change", updateMatch);

    return () => media.removeEventListener("change", updateMatch);
  }, [query]);

  return matches;
};

export const useColumnViewPreference = (): {
  isColumnView: boolean;
  setColumnView: (value: boolean) => void;
  getIsColumnView: () => boolean;
} => {
  const isSmallScreen = useMediaQuery("(max-width: 1024px)");
  const initialIsColumnView = localStorage.getItem("isColumnView") === "true";

  const [isColumnView, setIsColumnView] = useState<boolean>(
    isSmallScreen ? true : initialIsColumnView
  );

  const setColumnView = (value: boolean): void => {
    localStorage.setItem("isColumnView", JSON.stringify(value));
    setIsColumnView(value);
  };

  useEffect(() => {
    setIsColumnView(isSmallScreen);
  }, [isSmallScreen]);

  const getIsColumnView = (): boolean => {
    return localStorage.getItem("isColumnView") === "true";
  };


  return { isColumnView, setColumnView, getIsColumnView };
};