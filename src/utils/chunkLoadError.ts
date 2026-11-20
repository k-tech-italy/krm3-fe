const RELOADED_AT_KEY = "krm3:chunk-reload-at";
/** A second failure within this time is not retried, so a really missing file cannot loop. */
const RETRY_INTERVAL_MS = 10_000;

/**
 * Reloads the page once when a lazily loaded chunk cannot be fetched.
 *
 * After a deploy the chunk names change: a tab opened on the previous version asks for files that no
 * longer exist the first time it opens a page it has not loaded yet. Reloading fetches the new version.
 */
export function handleChunkLoadError(
  event: Event,
  storage: Pick<Storage, "getItem" | "setItem">,
  reload: () => void,
  now: number = Date.now()
): void {
  let last = 0;
  try {
    last = Number(storage.getItem(RELOADED_AT_KEY)) || 0;
  } catch {
    // storage unavailable: still reload once, there is no state to loop on
  }
  if (now - last < RETRY_INTERVAL_MS) return; // let the error through
  try {
    storage.setItem(RELOADED_AT_KEY, String(now));
  } catch {
    // ignore
  }
  event.preventDefault();
  reload();
}

export function reloadOnChunkLoadError(): void {
  window.addEventListener("vite:preloadError", (event) =>
    handleChunkLoadError(event, window.sessionStorage, () => window.location.reload())
  );
}
