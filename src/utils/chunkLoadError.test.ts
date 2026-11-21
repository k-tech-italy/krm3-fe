import { describe, expect, it, vi } from "vitest";
import { handleChunkLoadError } from "./chunkLoadError";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("handleChunkLoadError", () => {
  it("reloads once and lets a repeated failure through", () => {
    const storage = memoryStorage();
    const reload = vi.fn();

    const first = new Event("vite:preloadError", { cancelable: true });
    handleChunkLoadError(first, storage, reload, 100_000);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(first.defaultPrevented).toBe(true);

    // the reloaded page still fails: no loop, the error is not swallowed
    const second = new Event("vite:preloadError", { cancelable: true });
    handleChunkLoadError(second, storage, reload, 105_000);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(second.defaultPrevented).toBe(false);

    // a later failure (e.g. the next deploy) reloads again
    handleChunkLoadError(new Event("vite:preloadError"), storage, reload, 200_000);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it("reloads even when the storage cannot be used", () => {
    const reload = vi.fn();
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    handleChunkLoadError(new Event("vite:preloadError"), broken, reload, 100_000);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
