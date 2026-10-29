import { useSyncExternalStore } from "react";

// Site-wide motion preference.
// Effective value: the explicit user choice (localStorage) if set, otherwise
// the inverse of `prefers-reduced-motion`. The server snapshot is `false`, so
// nothing animates before hydration.

const STORAGE_KEY = "trappist:motion";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type ExplicitPref = "on" | "off" | null;

const listeners = new Set<() => void>();

// `undefined` = not read yet (read lazily on the client only).
let explicitPref: ExplicitPref | undefined;
let mediaQuery: MediaQueryList | null | undefined;

function readStoredPref(): ExplicitPref {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "on" || value === "off" ? value : null;
  } catch {
    return null;
  }
}

function getExplicitPref(): ExplicitPref {
  if (explicitPref === undefined) {
    explicitPref = readStoredPref();
  }
  return explicitPref;
}

function getMediaQuery(): MediaQueryList | null {
  if (mediaQuery === undefined) {
    try {
      mediaQuery =
        typeof window.matchMedia === "function"
          ? window.matchMedia(REDUCED_MOTION_QUERY)
          : null;
    } catch {
      mediaQuery = null;
    }
  }
  return mediaQuery;
}

function getSnapshot(): boolean {
  const pref = getExplicitPref();
  if (pref !== null) {
    return pref === "on";
  }
  const query = getMediaQuery();
  return query ? !query.matches : true;
}

function getServerSnapshot(): boolean {
  return false;
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleMediaChange(): void {
  notify();
}

function handleStorage(event: StorageEvent): void {
  // `key === null` means the storage area was cleared.
  if (event.key !== null && event.key !== STORAGE_KEY) {
    return;
  }
  explicitPref = readStoredPref();
  notify();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    getMediaQuery()?.addEventListener("change", handleMediaChange);
    window.addEventListener("storage", handleStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      getMediaQuery()?.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", handleStorage);
    }
  };
}

/** Whether animations should run. Always `false` during SSR and hydration. */
export function useMotionEnabled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Store an explicit motion preference and notify all subscribers. */
export function setMotionEnabled(on: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  explicitPref = on ? "on" : "off";
  try {
    window.localStorage.setItem(STORAGE_KEY, explicitPref);
  } catch {
    // Storage unavailable (private mode, blocked): keep the in-memory value.
  }
  notify();
}

/** Flip the current effective motion preference. */
export function toggleMotion(): void {
  if (typeof window === "undefined") {
    return;
  }
  setMotionEnabled(!getSnapshot());
}
