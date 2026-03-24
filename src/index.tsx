import React from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { ThemeProvider } from "next-themes";

const root = createRoot(document.getElementById("root") as HTMLElement);

if (localStorage.getItem("theme") === "auto") {
  localStorage.removeItem("theme");
}

root.render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" storageKey="theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
