// 30-minute inactivity sign-out, mirrored in the browser so the screen never shows a stale "signed in".
// The Worker enforces the same rule (sliding session expiry). While the person is active, a light
// keep-alive call every few minutes keeps their server session from expiring under them.

import { useEffect, useRef } from "react";
import { IDLE_MINUTES, SLIDE_EVERY_MINUTES } from "../../shared/session";

const KEY = "verdi.lastActive";
const IDLE_MS = IDLE_MINUTES * 60_000;

const read = () => {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
};
const write = (t: number) => {
  try {
    localStorage.setItem(KEY, String(t)); // shared by all tabs
  } catch {
    /* private mode */
  }
};

/** Mark "now" as activity (e.g. right after signing in). */
export const markActive = () => write(Date.now());

export function useIdleSignOut({ active, onTimeout, keepAlive }: { active: boolean; onTimeout: () => void; keepAlive: () => void }) {
  const cb = useRef({ onTimeout, keepAlive });
  cb.current = { onTimeout, keepAlive };

  useEffect(() => {
    if (!active) return;
    // Coming back after the limit (e.g. a tab left open overnight): sign out straight away.
    const last = read();
    if (last && Date.now() - last > IDLE_MS) {
      cb.current.onTimeout();
      return;
    }
    if (!last) markActive();
    let lastPing = Date.now();
    let lastWrite = 0;
    const activity = () => {
      const now = Date.now();
      if (now - lastWrite > 15_000) {
        write(now);
        lastWrite = now;
      }
      if (now - lastPing > SLIDE_EVERY_MINUTES * 60_000) {
        lastPing = now;
        cb.current.keepAlive();
      }
    };
    const check = () => {
      if (Date.now() - read() > IDLE_MS) cb.current.onTimeout();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart", "mousemove"] as const;
    for (const e of events) window.addEventListener(e, activity, { passive: true });
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(check, 30_000);
    return () => {
      for (const e of events) window.removeEventListener(e, activity);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, [active]);
}
