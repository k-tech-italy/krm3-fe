import { useEffect } from "react";
import { ThemeProvider } from "next-themes";

const STORAGE_KEY = "theme";

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "auto") {
    localStorage.removeItem(STORAGE_KEY);
  }

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue === "auto") {
        localStorage.removeItem(STORAGE_KEY);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" storageKey={STORAGE_KEY}>
      {children}
    </ThemeProvider>
  );
}
