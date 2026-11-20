import React from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { ThemeProvider } from "next-themes";
import { reloadOnChunkLoadError } from "./utils/chunkLoadError";

reloadOnChunkLoadError();

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
