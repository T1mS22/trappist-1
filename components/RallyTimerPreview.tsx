"use client";

import { useEffect, useRef, useState } from "react";
import localFont from "next/font/local";
import { useMotionEnabled } from "@/lib/motion";

// DSEG7 Classic (OFL-1.1, see app/fonts/DSEG-LICENSE.txt): the 7-segment face
// the real app uses for its timers.
const segFont = localFont({
  src: "../app/fonts/DSEG7Classic-Regular.woff2",
  display: "swap",
  variable: "--font-seg",
});

// The mock replicates the app's light UI, so its colors are fixed here
// instead of coming from the site theme. ACCENT is the app's orange accent.
const ACCENT = "#ff7a00";
const DIGITS_ACTIVE = "#111111";
const DIGITS_INACTIVE = "#d4d4d4";

/** Initial values of the active timers, in milliseconds. */
const INITIAL_MS = [85_370, 12_200, 128_710, 52_890, 215_430, 62_040];
const INACTIVE_ROWS = 2;
const FINAL_SECONDS_MS = 10_000;
/** How long a finished timer shows 00:00:00 before it restarts. */
const ZERO_HOLD_MS = 1200;
const MAX_FRAME_DELTA_MS = 100;
/** Minimum time between re-renders (~30 fps). */
const MIN_COMMIT_MS = 33;

/** Static frame shown without motion: timer 2 in its final seconds. */
const STATIC_HUNDREDTHS = INITIAL_MS.map((ms, i) =>
  i === 1 ? 742 : Math.floor(ms / 10),
);

type Frame = {
  /** Displayed value per active timer, in hundredths of a second. */
  hundredths: number[];
  /** Index of the timer counting down its final seconds, or -1. */
  finalIndex: number;
};

const STATIC_FRAME: Frame = { hundredths: STATIC_HUNDREDTHS, finalIndex: 1 };

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatHundredths(total: number): string {
  const minutes = Math.floor(total / 6000);
  const seconds = Math.floor(total / 100) % 60;
  return `${pad(minutes)}:${pad(seconds)}:${pad(total % 100)}`;
}

/** Shortest running timer below 10 s, or -1. */
function findFinalIndex(remaining: Float64Array, holds: Float64Array): number {
  let best = -1;
  for (let i = 0; i < remaining.length; i++) {
    if (
      holds[i] <= 0 &&
      remaining[i] < FINAL_SECONDS_MS &&
      (best < 0 || remaining[i] < remaining[best])
    ) {
      best = i;
    }
  }
  return best;
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[15px]" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
    </svg>
  );
}

function SpeakerIcon({ pulse }: { pulse: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={pulse ? "size-3 animate-pulse" : "size-3"}
      fill={ACCENT}
    >
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

export default function RallyTimerPreview() {
  const motionEnabled = useMotionEnabled();
  const containerRef = useRef<HTMLDivElement>(null);
  // Kept across pauses so the timers resume where they stopped.
  const remainingRef = useRef<Float64Array | null>(null);
  const holdsRef = useRef<Float64Array | null>(null);
  const [liveFrame, setLiveFrame] = useState<Frame>(() => ({
    hundredths: INITIAL_MS.map((ms) => Math.floor(ms / 10)),
    finalIndex: -1,
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!motionEnabled || !container) {
      return;
    }
    const remaining = (remainingRef.current ??= Float64Array.from(INITIAL_MS));
    const holds = (holdsRef.current ??= new Float64Array(INITIAL_MS.length));
    const shown = new Int32Array(INITIAL_MS.length).fill(-1);
    let shownFinal = -2;

    let rafId = 0;
    let lastTime = -1;
    let lastCommit = -Infinity;
    let onScreen = false;
    let pageVisible = document.visibilityState === "visible";

    function advance(dt: number) {
      for (let i = 0; i < remaining.length; i++) {
        if (holds[i] > 0) {
          holds[i] -= dt;
          if (holds[i] <= 0) {
            holds[i] = 0;
            remaining[i] = INITIAL_MS[i];
          }
          continue;
        }
        remaining[i] -= dt;
        if (remaining[i] <= 0) {
          remaining[i] = 0;
          holds[i] = ZERO_HOLD_MS;
        }
      }
    }

    function commit(time: number, force: boolean) {
      if (!force && time - lastCommit < MIN_COMMIT_MS) {
        return;
      }
      const finalIndex = findFinalIndex(remaining, holds);
      let changed = finalIndex !== shownFinal;
      for (let i = 0; i < remaining.length; i++) {
        const value = Math.floor(remaining[i] / 10);
        if (value !== shown[i]) {
          shown[i] = value;
          changed = true;
        }
      }
      if (!changed) {
        return;
      }
      shownFinal = finalIndex;
      lastCommit = time;
      setLiveFrame({ hundredths: Array.from(shown), finalIndex });
    }

    function tick(time: number) {
      rafId = 0;
      if (!onScreen || !pageVisible) {
        lastTime = -1;
        return;
      }
      if (lastTime >= 0) {
        advance(Math.min(time - lastTime, MAX_FRAME_DELTA_MS));
      }
      lastTime = time;
      commit(time, false);
      rafId = requestAnimationFrame(tick);
    }

    function update() {
      if (onScreen && pageVisible) {
        if (!rafId) {
          lastTime = -1;
          rafId = requestAnimationFrame(tick);
        }
        return;
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      lastTime = -1;
    }

    commit(performance.now(), true);

    const intersectionObserver = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      update();
    });
    intersectionObserver.observe(container);

    function handleVisibility() {
      pageVisible = document.visibilityState === "visible";
      update();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [motionEnabled]);

  const frame = motionEnabled ? liveFrame : STATIC_FRAME;

  return (
    <figure className={`${segFont.variable} flex flex-col items-center`}>
      <div
        ref={containerRef}
        role="img"
        aria-label="Live preview of the Rallye Timer app: several rally countdown timers, the shortest one counting down its final seconds."
        className="aspect-[9/19] w-[260px] max-w-full rounded-[2.25rem] border border-line bg-[#050608] p-2"
      >
        <div
          aria-hidden="true"
          className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[#fafafa] select-none"
        >
          <div
            className="flex h-5 shrink-0 items-end px-5 pb-0.5 text-[9px] leading-none font-semibold text-white/90"
            style={{ backgroundColor: ACCENT }}
          >
            9:30
          </div>
          <div
            className="relative flex h-10 shrink-0 items-center justify-center text-white shadow-[0_1px_3px_rgb(0_0_0/0.2)]"
            style={{ backgroundColor: ACCENT }}
          >
            <span className="text-[15px] font-semibold">Rallye Timer</span>
            <span className="absolute right-3.5">
              <GearIcon />
            </span>
          </div>
          <ol className="flex flex-1 flex-col">
            {frame.hundredths.map((value, i) => {
              const finished = value === 0;
              const highlighted = finished || i === frame.finalIndex;
              return (
                <li
                  key={i}
                  className="flex flex-1 items-center border-b border-[#ececec]"
                >
                  <span className="flex w-10 shrink-0 items-center gap-1 pl-3 text-[11px] text-[#555]">
                    {i + 1}
                    {i === frame.finalIndex && (
                      <SpeakerIcon pulse={motionEnabled} />
                    )}
                  </span>
                  <span
                    className="flex-1 pr-4 text-center text-[26px] leading-none tabular-nums"
                    style={{
                      fontFamily: "var(--font-seg)",
                      color: highlighted ? ACCENT : DIGITS_ACTIVE,
                    }}
                  >
                    {formatHundredths(value)}
                  </span>
                </li>
              );
            })}
            {Array.from({ length: INACTIVE_ROWS }, (_, i) => (
              <li
                key={`inactive-${i}`}
                className="flex flex-1 items-center border-b border-[#ececec]"
              >
                <span className="w-10 shrink-0 pl-3 text-[11px] text-[#bdbdbd]">
                  {INITIAL_MS.length + i + 1}
                </span>
                <span
                  className="flex-1 pr-4 text-center text-[26px] leading-none tabular-nums"
                  style={{
                    fontFamily: "var(--font-seg)",
                    color: DIGITS_INACTIVE,
                  }}
                >
                  00:00:00
                </span>
              </li>
            ))}
          </ol>
          <div className="m-2.5 flex h-9 shrink-0 items-center justify-center rounded-md bg-[#616161] text-[13px] font-semibold text-white shadow-sm">
            Stop
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center font-mono text-[11px] text-muted">
        live preview · shown in the app&apos;s orange accent
      </figcaption>
    </figure>
  );
}
