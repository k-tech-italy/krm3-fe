import { useTheme } from "next-themes";
import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 dark:bg-gray-800/80 dark:border-gray-700/50 dark:hover:bg-gray-700/90"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-500 transition-all duration-300" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700 transition-all duration-300" />
      )}
    </button>
  );
}